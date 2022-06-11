timestamp := $(shell date +%s)
project := cards
target := root@159.65.118.49

deploy:
	echo 'Deploying to $(target)'\
	&& rsync -azP dist/apps/$(project)/ $(target):/var/www/html\
