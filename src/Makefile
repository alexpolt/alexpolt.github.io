
md := perl ../markdown/markdown.pl
tmpl := tmpl-header.html tmpl-footer.html
targets := $(patsubst %.md,../%.html,$(wildcard *.md))

all: $(targets)

#special treatment for index
../index.html : index.md
	cat tmpl-header.html > $@
	echo -e '<div id="contents>"\n' >> $@
	$(md) $< >> $@
	echo -e '\n</div>\n' >> $@
	cat tmpl-footer.html >> $@
	git add $< $@

$(filter-out %index.html,$(targets)) : ../%.html : %.md $(tmpl) 
	cat tmpl-header.html > $@
	$(md) $< >> $@
	cat tmpl-footer.html >> $@
	git add $< $@

$(tmpl) : ;

