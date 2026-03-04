git add --all
date=$(date '+%d-%m-%Y')
git commit -m "${date} bak"
branch=$(git branch --show-current)
git push -u origin "$branch"

#touch .gitignore && echo "electron_wp\node_modules" >> .gitignore && git rm -r --cached node_modules ; git status # to remove node modules