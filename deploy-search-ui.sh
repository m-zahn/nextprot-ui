#!/bin/bash
set -x


if [ -z "$1" ] 
    then 
        echo "Specify the environment where to deploy [dev,build,alpha,pro]"
    exit 0
fi

stopDebugModeAndExit () {
  set +x; exit $1
}



echo "deploy to $1"
rm -rf build || stopDebugModeAndExit 1
./node_modules/.bin/brunch build -P || stopDebugModeAndExit 2

sedcmd="s/NX_ENV/$1/g"
sed $sedcmd build/js/app.js > tmp.dat
mv tmp.dat build/js/app.js

# pour pro, send to plato, see target directory there

if [ $1 = "dev" ]; then
    rsync -auv build/* npteam@crick:/work/www/dev-search.nextprot.org/ || stopDebugModeAndExit 3
elif [ $1 = "pro" ]; then
  rsync -auv build/* npteam@plato:/work/www/search.nextprot.org/ || stopDebugModeAndExit 3
elif [ $1 = "build" ]; then
    rsync -auv build/* npteam@kant:/work/www/build-search.nextprot.org/ || stopDebugModeAndExit 3
elif [ $1 = "alpha" ]; then
    rsync -auv build/* npteam@uat-web2:/work/www/alpha-search.nextprot.org/ || stopDebugModeAndExit 3
else
    echo "wrong environment"
fi

