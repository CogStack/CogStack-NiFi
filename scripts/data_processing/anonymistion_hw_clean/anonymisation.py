#!/usr/bin/env python

"""rule based anonymisation"""

# __author__      = "Silverash Wu"
# __copyright__   = "Copyright 2020, Planet Earth"

import os, fnmatch
import json
import re
from chardet import detect
from os.path import isfile, join
from os import device_encoding, listdir
import logging
import utils

class AnonymiseRule(object):
    def __init__(self, rule_file):
        self._rules = utils.load_json_data(rule_file)

    @staticmethod
    def rul_extraction(full_text, re_objs):
        results = []
        for ro in re_objs:
            if 'disabled' in ro and ro['disabled']:
                continue
            flag = 0
            if 'multiline' in ro['flags']:
                flag |= re.MULTILINE
            if 'ignorecase' in ro['flags']:
                flag |= re.IGNORECASE
            matches = re.finditer(ro['pattern'], full_text, flag)
            for m in matches:
                ret = {'type': ro['data_type'], 'attrs': {}}
                results.append(ret)
                ret['attrs']['full_match'] = m.group(0)
                ret['pos'] = m.span()
                i = 1
                if 'data_labels' in ro:
                    for attr in ro['data_labels']:
                        ret['attrs'][attr] = m.group(i)
                        i += 1
        return results

    def do_letter_parsing(self, full_text):
        re_exps = self._rules
        results = []
        header_pos = -1
        tail_pos = -1
        header_result = self.rul_extraction(full_text, [re_exps['letter_header_splitter']])
        tail_result = self.rul_extraction(full_text, [re_exps['letter_end_splitter']])
        results += header_result
        if len(header_result) > 0:
            header_pos = header_result[0]['pos'][0]
            header_text = full_text[:header_pos]
            phone_results = self.rul_extraction(header_text, re_exps['phone'])
            dr_results = self.rul_extraction(header_text, [re_exps['doctor']])
            results += phone_results
            results += dr_results
        if len(tail_result) > 0:
            tail_pos = tail_result[0]['pos'][1]
            tail_text = full_text[tail_pos:]
            for sent_type in re_exps['sent_rules']:
                results += self.rul_extraction(tail_text, re_exps[sent_type])
        return results, header_pos, tail_pos

    def do_full_text_parsing(self, full_text):
        re_exps = self._rules
        matched_rets = []
        for st in re_exps['sent_rules']:
            rules = re_exps['sent_rules'][st]
            matched_rets += self.rul_extraction(full_text, rules if type(rules) is list else [rules])
        return matched_rets, 0, 0

    @staticmethod
    def do_replace(text, pos, sent_text, replace_char=' '):
        return text[:pos] + re.sub(r'[^\n\s]', replace_char, sent_text) + text[pos+len(sent_text):]


def anonymise_doc(doc_id, text, failed_docs, anonymis_inst, sent_container):
    """
    anonymise a document
    :param doc_id:
    :param text:
    :param failed_docs:
    :param anonymis_inst: anonymise_rule instance
    :return:
    """
    # rets = do_letter_parsing(text)
    rets = anonymis_inst.do_full_text_parsing(text)
    if rets[1] < 0 or rets[2] < 0:
        failed_docs.append(doc_id)
        logging.info('````````````` %s failed' % doc_id)
        return None, None
    else:
        sen_data = rets[0]
        anonymised_text = text
        for d in sen_data:
            if 'name' in d['attrs']:
                logging.debug('removing %s [%s] ' % (d['attrs']['name'], d['type']))
                if is_valid_place_holder(d['attrs']['name']):
                    anonymised_text = AnonymiseRule.do_replace(anonymised_text, d['pos'][0] + d['attrs']['full_match'].find(d['attrs']['name']), d['attrs']['name'])
                    # 'x' * len(d['attrs']['name']))
                sent_container.append({'type': d['type'], 'sent': d['attrs']['name']})
            if 'number' in d['attrs']:
                logging.debug ('removing %s ' % d['attrs']['number'])
                if is_valid_place_holder(d['attrs']['number']):
                    anonymised_text = AnonymiseRule.do_replace(anonymised_text, d['pos'][0], d['attrs']['number'])
                sent_container.append({'type': d['type'], 'sent': d['attrs']['number']})
    
        return anonymised_text, sen_data

# get file encoding type
def get_encoding_type(file):
    with open(file, 'rb') as f:
        rawdata = f.read()
    return detect(rawdata)['encoding']

def is_valid_place_holder(s):
    return len(s) >= 2 if s is not None else False 

def get_lookup_data_and_rule(lookups_folder="./lookups"):
    """
        :returns: list of things to look up in the text and de-identify
    """
    lookup_files = []

    lookup_data = []

    if lookups_folder is not None:
        for root, dirs, files in os.walk(lookups_folder):
            for file_name in files:
                lookup_files.append(os.path.join(root, file_name))
    
    for file_path in lookup_files:
        with open(file_path, encoding="utf8", errors="ignore") as f:
            words = f.read().split("\n")
            for word in words:
                if len(word) > 1:
                    lookup_data.extend([word, word.upper()])
    
    # add uppercase 
    return re.compile(r'\b(' +  '|'.join(list(set(lookup_data)))  + r')\b')

def lookup_anonymise(anonymised_text, rule):
    at = rule.sub('', anonymised_text)
    return at

# do not anonymise files that have this extension(useful for reanonymising)
anonymised_file_ext="_anonymised.txt"
file_extension_to_match=".txt"
file_name_text_pattern_to_match="[(EDT|ELT)]*" + file_extension_to_match

def anonymise_files(dir_and_file_list):

    pass

def dir_anonymisation(folder, rule_file, output_folder=None, use_lookups=True):
    """
        use lookups to remove person names & post_codes : can be ineffective if the names are also disease names
    """
    anonymis_inst = AnonymiseRule(rule_file)
    
    #onlyfiles = [f for f in listdir(folder) if isfile(join(folder, f)) and f.endswith(file_text_pattern_to_match) and anonymised_file_ext not in f]
    
    container = []  
    root_dir_and_files = []
    sent_data = []

    # get the data at the beginning so we avoid opening files for each file
    lookup_rule =  get_lookup_data_and_rule()

    for root, dirs, files in os.walk(folder):
        for name in files:
            if fnmatch.fnmatch(name, file_name_text_pattern_to_match) and anonymised_file_ext not in name:
                root_dir_and_files.append((root, name))
 
    for root_dir_and_file in root_dir_and_files:
        
        text = utils.read_text_file_as_string(join(root_dir_and_file[0], root_dir_and_file[1]), encoding=get_encoding_type(os.path.join(root_dir_and_file[0], root_dir_and_file[1])))
        anonymised, sensitive_data = anonymise_doc(root_dir_and_file[1], text, container, anonymis_inst, sent_data)

        file_name_without_extension = root_dir_and_file[1][:-len(file_extension_to_match)]
        new_anonymised_file_name = file_name_without_extension + anonymised_file_ext
        
        sent_data.append(sensitive_data)

        if root_dir_and_file is not None:
                    
            if use_lookups:
                anonymised = lookup_anonymise(anonymised, lookup_rule)
                
            if output_folder is None:
                utils.save_string(anonymised, os.path.join(root_dir_and_file[0], new_anonymised_file_name))
                logging.info('anonymised %s saved to %s' % (new_anonymised_file_name, root_dir_and_file[0]))
            else:
                utils.save_string(anonymised, os.path.join(output_folder, root_dir_and_file[0], new_anonymised_file_name))
                logging.info('anonymised %s saved to %s' % (new_anonymised_file_name, os.path.join(output_folder,root_dir_and_file[0])))
        else:
            logging.info('[anonymised %s]:\n%s\n\n' % (new_anonymised_file_name, anonymised))

    if output_folder is not None:
        utils.save_json_array(sent_data, join(output_folder, 'sensitive_data.json'))
        logging.info('sensitive data saved to %s' % output_folder)
  
    return sent_data


if __name__ == "__main__":
    logging.basicConfig(level='INFO', format='[%(filename)s:%(lineno)d] %(asctime)s %(message)s')
    dir_anonymisation('../../../data/Cogstack_20210222/',
                      './conf/anonymise_rules.json',
                     # './anonymised/'
                     )
