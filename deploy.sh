if [ -z "$1" ]
then
  npm run build
  git add dist
  git commit -m "Update dist"
fi
git subtree push --prefix dist origin gh-pages
