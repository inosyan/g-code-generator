ORGFILE='G-CodeGenerator.jsx'
OUTPUT='dist/G-CodeGenerator.jsx'

BASEDIR=$(cd $(dirname $0);echo $PWD)
rm -f $OUTPUT

IFS=$'\n'
while read -r LINE || [ -n "${LINE}" ]
do
	if [[ $LINE == *"#include"* ]]; then
		CLASSPATH=${LINE/\#include \'/}
		CLASSPATH=${CLASSPATH/\';/}
		CLASSPATH=`tr -d '\r' <<< $CLASSPATH`
		CLASSPATH="$BASEDIR/$CLASSPATH"
		while IFS= read -r LINE2 || [ -n "${LINE2}" ]
		do
			echo $LINE2 >> $OUTPUT
		done < $CLASSPATH
		echo "" >> $OUTPUT
	else
		echo $LINE >> $OUTPUT
	fi
done < $ORGFILE
IFS=$' \t\n'
