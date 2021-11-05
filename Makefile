timestamp := $(shell date +%s)
project := cards
target := root@104.248.43.19

deploy:
	echo 'Deploying to $(target)'\
	&& rsync -azP dist/apps/$(project)/ $(target):/var/www/example.com\
