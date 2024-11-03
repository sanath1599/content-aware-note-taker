cd /root/content-aware-note-taker
git pull
cd /root/content-aware-note-taker/cant-fe
npm i
npm run build
cd /root/content-aware-note-taker/app-fe
npm i
npm run build
sudo cp -r /root/content-aware-note-taker/cant-fe/build/* /var/www/cant.study/
sudo cp -r /root/content-aware-note-taker/app-fe/build/* /var/www/wehelpyou.study/
cd /root/content-aware-note-taker/backend
npm i
sudo pm2 restart 0

echo "Updated cant.study and wehelpyou.study"
