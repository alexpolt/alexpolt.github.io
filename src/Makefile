SHELL=bash
MAKEFLAGS += -r
md := perl ../markdown/markdown.pl
git := git
tmpl := tmpl-header.html tmpl-footer.html
tmpl2 := tmpl-header2.html tmpl-header2ru.html tmpl-footer2.html
targets := $(patsubst %.md,../%.html,$(wildcard *.md))

all: $(targets)


# special treatment for index
../inde%.html : inde%.md $(tmpl)
	cat tmpl-header.html > $@
	echo -e '<div id="contents">\n' >> $@
	$(md) $< >> $@
	echo -e '\n</div>\n' >> $@
	cat tmpl-footer.html >> $@
	$(git) add $< $@
# $(git) commit


../r%en.html : r%en.md $(tmpl2)
#	cat tmpl-header.html > $@
	title=`grep -m1  '##.*' $< | cut -b3-` && sed "s/<title>\(.*\)<\/title>/<title>$${title} - \1<\/title>/" tmpl-header2.html > $@
	$(md) $< >> $@
	cat tmpl-footer2.html >> $@
	$(git) add $< $@
#	$(git) commit

../r%ru.html : r%ru.md $(tmpl2)
#	cat tmpl-header.html > $@
	title=`grep -m1  '##.*' $< | cut -b3-` && sed "s/<title>\(.*\)<\/title>/<title>$${title} - \1<\/title>/" tmpl-header2ru.html > $@
	$(md) $< >> $@
	cat tmpl-footer2.html >> $@
	$(git) add $< $@
#	$(git) commit


../%.html : %.md $(tmpl)
#	cat tmpl-header.html > $@
	title=`grep -m1  '##.*' $< | cut -b3-` && sed "s/<title>\(.*\)<\/title>/<title>$${title} - \1<\/title>/" tmpl-header.html > $@
	$(md) $< >> $@
	cat tmpl-footer.html >> $@
	$(git) add $< $@
#	$(git) commit


$(tmpl) : ;


