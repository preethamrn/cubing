#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd dist

echo 'www.preethamrn.com' > CNAME

git init
git add -A
git commit -m "deploy $1" 

git push -f git@github.com:preethamrn/preethamrn.github.io.git master

cd -
