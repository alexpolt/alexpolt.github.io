
md := perl ../markdown/markdown.pl
git := git
tmpl := tmpl-header.html tmpl-footer.html
targets := $(patsubst %.md,../%.html,$(wildcard *.md))

all: $(targets)

$(targets) : ../%.html : %.md $(tmpl) 
#	cat tmpl-header.html > $@
	title=`grep -m1  '##.*' $< | cut -b3-` && sed "s/<title>\(.*\)<\/title>/<title>$${title} - \1<\/title>/" tmpl-header.html > $@
	$(md) $< >> $@
	cat tmpl-footer.html >> $@
	$(git) add $< $@
#	$(git) commit

# special treatment for index
../index.html : index.md $(tmpl)
	cat tmpl-header.html > $@
	echo -e '<div id="contents">\n' >> $@
	$(md) $< >> $@
	echo -e '\n</div>\n' >> $@
	cat tmpl-footer.html >> $@
	$(git) add $< $@
# $(git) commit

../rvru.html ../ruru.html : ../%ru.html : %ru.md $(tmpl)
#	cat tmpl-header.html > $@
	title=`grep -m1  '##.*' $< | cut -b3-` && sed "s/<title>\(.*\)<\/title>/<title>$${title} - \1<\/title>/" tmpl-header-ru.html > $@
	$(md) $< >> $@
	cat tmpl-footer.html >> $@
	$(git) add $< $@
#	$(git) commit


$(tmpl) : ;


