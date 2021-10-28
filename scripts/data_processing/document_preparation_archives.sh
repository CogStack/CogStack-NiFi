#!/usr/bin/env bash

# global defines
#
SOFFICE_BIN="/usr/bin/libreoffice"
DATA_DIR="../../data/"
SIZE_KIND="small"  # can be 'small' or 'full'

IN_MT_DATA="$DATA_DIR/mtsamples-txt-$SIZE_KIND.tgz"

OUT_MT_DOCX_DATA="$DATA_DIR/mtsamples-docx-$SIZE_KIND.tar.bz2"
OUT_MT_PDF_TEXT_DATA="$DATA_DIR/mtsamples-pdf-text-$SIZE_KIND.tar.bz2"
OUT_MT_PDF_IMG_DATA="$DATA_DIR/mtsamples-pdf-img-$SIZE_KIND.tar.bz2"
OUT_MT_JPG_DATA="$DATA_DIR/mtsamples-jpg-$SIZE_KIND.tar.bz2"

TMP_DIR=__tmp
OUT_DOCX_DIR=__out_pdf
OUT_PDF_TEXT_DIR=__out_pdf_text
OUT_JPG_DIR=__out_jpg
OUT_PDF_IMG_DIR=__out_pdf_jpg
LOG_FILE=__prepare_docs.log


# entry point
#

# check whether the LibreOffice is installed, etc
#
if [ ! -e $SOFFICE_BIN ]; then
	echo "Please set the path for LibreOffice soffice binary"
	exit 1
fi

if [ ! -e $IN_MT_DATA ]; then
	echo "Input $IN_MT_DATA file missing"
	exit 1
fi


echo "Preparing the documents data for the examples"


# decompress the text files
#
echo "Decompressing mt samples data"
if [ -e $TMP_DIR ]; then rm -rf $TMP_DIR; fi
mkdir $TMP_DIR

tar -xzf $IN_MT_DATA -C $TMP_DIR


# process the documents
#
if [ -e $LOG_FILE ]; then rm $LOG_FILE; fi

NF=$(ls -l $TMP_DIR | wc -l)
echo "Processing the documents -- files in total: $NF"

echo "Converting: TXT -> DOCX"

if [ -e $OUT_DOCX_DIR ]; then rm -rf $OUT_DOCX_DIR; fi
mkdir $OUT_DOCX_DIR

echo "*---> processing documents in bulk using LibreOffice"
$SOFFICE_BIN --headless --invisible --convert-to docx --outdir $OUT_DOCX_DIR $TMP_DIR/mtsamples-type-*.txt >> $LOG_FILE

echo "*---> compressing the documents and storing them as $OUT_MT_DOCX_DATA"
( cd $OUT_DOCX_DIR && tar -cJf ../$OUT_MT_DOCX_DATA mtsamples-type-*.docx )


echo "Converting: TXT -> PDF"

if [ -e $OUT_PDF_TEXT_DIR ]; then rm -rf $OUT_PDF_TEXT_DIR; fi
mkdir $OUT_PDF_TEXT_DIR

echo "*---> processing documents in bulk using LibreOffice"
$SOFFICE_BIN --headless --invisible --convert-to pdf --outdir $OUT_PDF_TEXT_DIR $TMP_DIR/mtsamples-type-*.txt >> $LOG_FILE

echo "*---> compressing the documents and storing them as $OUT_MT_PDF_DATA"
( cd $OUT_PDF_TEXT_DIR && tar -cJf ../$OUT_MT_PDF_TEXT_DATA mtsamples-type-*.pdf )


echo "Converting: TXT -> JPG"

if [ -e $OUT_JPG_DIR ]; then rm -rf $OUT_JPG_DIR; fi
mkdir $OUT_JPG_DIR

echo "*---> processing documents in bulk using LibreOffice"
$SOFFICE_BIN --headless --invisible --convert-to jpg --outdir $OUT_JPG_DIR $TMP_DIR/mtsamples-type-*.txt >> $LOG_FILE

echo "*---> compressing the documents and storing them as $OUT_MT_JPG_DATA"
( cd $OUT_JPG_DIR && tar -cJf ../$OUT_MT_JPG_DATA mtsamples-type-*.jpg )


echo "Converting: JPG -> PDF"

if [ -e $OUT_PDF_IMG_DIR ]; then rm -rf $OUT_PDF_IMG_DIR; fi
mkdir $OUT_PDF_IMG_DIR

echo "*---> processing documents in bulk using LibreOffice"
$SOFFICE_BIN --headless --invisible --convert-to pdf --outdir $OUT_PDF_IMG_DIR $OUT_JPG_DIR/mtsamples-type-*.jpg >> $LOG_FILE

echo "*---> compressing the documents and storing them as $OUT_MT_JPG_DATA"
( cd $OUT_PDF_IMG_DIR && tar -cJf ../$OUT_MT_PDF_IMG_DATA mtsamples-type-*.pdf )


# cleanup
#
echo "Cleaning up"
rm -rf $TMP_DIR
rm -rf $OUT_PDF_TEXT_DIR
rm -rf $OUT_JPG_DIR
rm -rf $OUT_PDF_JPG_DIR


echo "Done."

echo "For more information on documents processing, see log: $LOG_FILE"
