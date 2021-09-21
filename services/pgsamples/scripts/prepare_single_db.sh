#!/usr/bin/env bash
set -e


# global variables
#
DB_USER='test'
DB_NAME='db_samples'

POSTGRES_USER=postgres

SQL_FILE=__update_mt.sql


error_handler() {
  echo "An error occured during preparing DB"
  echo "Cleaning up ..."
  rm -rf $TMP_DIR
  rm -rf $SQL_FILE
  psql -v ON_ERROR_STOP=0 -U $POSTGRES_USER -c "DROP DATABASE $DB_NAME"
  psql -v ON_ERROR_STOP=0 -U $POSTGRES_USER -c "DROP ROLE $DB_USER;"
  exit 1
}


# entry point
#
IN_SYN_DATA=$1
IN_MT_PDF_DATA=$2
IN_MT_TXT_DATA=$3
DB_DUMP_FILE=$4


# check whether files exist
#
if [ ! -e $IN_SYN_DATA ]; then echo "Missing input data: $IN_SYN_DATA" && exit 1; fi
if [ ! -e $IN_MT_PDF_DATA ]; then echo "Missing input data: $IN_MT_PDF_DATA" && exit 1; fi
if [ ! -e $IN_MT_TXT_DATA ]; then echo "Missing input data: $IN_MT_TXT_DATA" && exit 1; fi


# set error handler
#
trap 'error_handler' ERR SIGPIPE


# create the user, the database and set up the access
#
echo "Creating database: $DB_NAME and user: $DB_USER"
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" <<-EOSQL
CREATE DATABASE $DB_NAME;
CREATE ROLE $DB_USER WITH PASSWORD 'test' LOGIN;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO test;
EOSQL


# create schemas
#
echo "Defining DB schemas"
psql -v ON_ERROR_STOP=1 -U $DB_USER -d $DB_NAME -f db_create_schema.sql


# decompress the sample data
#
TMP_DIR=__tmp
if [ ! -e $TMP_DIR ]; then
	echo "Decompressing sample data"
	mkdir $TMP_DIR
	mkdir $TMP_DIR/syn
	mkdir $TMP_DIR/bin
	mkdir $TMP_DIR/txt
	tar -xzf $IN_SYN_DATA -C $TMP_DIR/syn
	tar -xJf $IN_MT_PDF_DATA -C $TMP_DIR/bin
	tar -xzf $IN_MT_TXT_DATA -C $TMP_DIR/txt
fi

# load data -- the secure option
#
echo "3-step loading data into DB:"
csv_files=(
	patients
	encounters
	observations)

echo "- Loading synthetic data"
for f in ${csv_files[@]}; do
	echo "*----> loading table: ${f}"
	header=$(head -n 1 "$TMP_DIR/syn/${f}.csv")
	tail -n +2 "$TMP_DIR/syn/${f}.csv" | psql -v ON_ERROR_STOP=1 -U $DB_USER -d $DB_NAME -c "COPY ${f}($header) FROM STDIN DELIMITER ',' CSV"
done

echo "- Parsing mt samples data"
if [ -e $SQL_FILE ]; then rm $SQL_FILE; fi


# process the binary content
#
i=1
pk=1
NF=$( ls -1q $TMP_DIR/bin/mtsamples-type-* | wc -l )

# HINT: we can multiply the documents count by x2-5
for f in $TMP_DIR/bin/mtsamples-type-*; do

	# parse the filename and read the document
	#
	s_id=$(echo $f | cut -d '-' -f 5 | cut -d '.' -f 1)
	type_id=$(echo $f | cut -d '-' -f 3)
	doc64=$( base64 < $f )

	# create SQL queries
	#
	echo "INSERT INTO \
			medical_reports_raw(docid, sampleid, typeid, dct, filename, binarydoc) \
			VALUES($pk, $s_id, $type_id, CURRENT_TIMESTAMP + RANDOM() * INTERVAL '1 years', E'$f', DECODE(E'$doc64', 'base64'));" >> $SQL_FILE
			# VALUES($pk, $s_id, $type_id, CURRENT_TIMESTAMP + RANDOM() * INTERVAL '5 years', E'$f', DECODE(E'$doc64', 'base64'));" >> $SQL_FILE

	echo "UPDATE encounters SET docid = $pk WHERE cid = $i;" >> $SQL_FILE

	# continue
	#
	let i=i+77
	let pk=pk+1
	if [ "$i" -gt "$NF" ]; then let i=i%NF+1; fi
done


# process the text content
#
i=1
pk=1
NF=$( ls -1q $TMP_DIR/txt/mtsamples-type-* | wc -l )

# HINT: we can multiply the documents count by x2-5
for f in $TMP_DIR/txt/mtsamples-type-*; do

	# parse the filename and read the document
	#
	s_id=$(echo $f | cut -d '-' -f 5 | cut -d '.' -f 1)
	type_id=$(echo $f | cut -d '-' -f 3)
	doc_txt=$(cat $f | sed -e "s/'/\\\'/g")

	# create SQL queries
	#
	echo "INSERT INTO \
			medical_reports_text(docid, sampleid, typeid, dct, filename, document) \
			VALUES($pk, $s_id, $type_id, CURRENT_TIMESTAMP + RANDOM() * INTERVAL '1 years', E'$f', E'$doc_txt');" >> $SQL_FILE

	# the binary and text documents should be synchronised by IDs
	#echo "UPDATE encounters SET docid = $pk WHERE cid = $i;" >> $SQL_FILE

	# continue
	#
	let i=i+77
	let pk=pk+1
	if [ "$i" -gt "$NF" ]; then let i=i%NF+1; fi
done


echo "- Loading mt samples data"
psql -v ON_ERROR_STOP=1 -U $DB_USER -d $DB_NAME -f $SQL_FILE > /dev/null


# perform a DB dump
#
echo "Done with initializing the sample data"
echo "Dumping the $DB_NAME DB into a compressed file $DB_DUMP_FILE"
pg_dump -U $DB_USER -d $DB_NAME -Z 9 > "$DB_DUMP_FILE"


# cleanup
#
echo "Cleaning up"
rm -r $TMP_DIR
rm -r $SQL_FILE
psql -v ON_ERROR_STOP=1 -U $POSTGRES_USER -c "DROP DATABASE $DB_NAME"
psql -v ON_ERROR_STOP=1 -U $POSTGRES_USER -c "DROP ROLE $DB_USER;"

echo "Done."
