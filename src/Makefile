
md := perl ../markdown/markdown.pl
targets := $(patsubst %.md,../%.html,$(wildcard *.md))
tmpl := tmpl-header.html tmpl-footer.html

all : $(targets)

$(targets) : ../%.html : %.md $(tmpl) 
	cat tmpl-header.html > $@
	$(md) $< >> $@
	cat tmpl-footer.html >> $@
	git add $< $@

$(tmpl) : ;

