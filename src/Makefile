
md := perl ../markdown/markdown.pl
targets := $(patsubst %.md,../%.html,$(wildcard *.md))

all : $(targets)

$(targets) : ../%.html : %.md
	cat tmpl-header.html > $@
	$(md) $< >> $@
	cat tmpl-footer.html >> $@
#	git add $< $@

