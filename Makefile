

public: components *.js *.css
	@component build \
		--dev \
		--use component-autoprefixer \
		--name asana-scrum \
		--out public

components: component.json
	@component install --dev

clean:
	rm -fr components public


.PHONY: clean

