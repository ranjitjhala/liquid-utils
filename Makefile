TSC=tsc --module commonjs --noImplicitAny

####################################################################

tsObjects := $(wildcard src/*.lhs)
jsObjects := $(patsubst %.ts,%.js,$(wildcard lib/*.ts))

####################################################################

all: $(jsObjects)

lib/%.js: lib/%.ts
	$(TSC) --out $@ $? 

