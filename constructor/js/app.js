class Constructor {
	constructor(game) {
		this.paper = Snap(window.innerWidth, window.innerHeight);
		this.constr = this.paper.svg(0, 0, window.innerWidth, window.innerHeight);
		this.rects = this.constr.g().addClass('rects');
		this.circles = this.constr.g().addClass('circles');

		this.gui = new GUI(this.paper, 'constructor/assets/icons.svg', [
			{
				icon: 'cross',
				action: () => {
					this.type = 'cross';
					this.typeShape = 'circle';
				}
			}, {
				icon: 'uncross',
				action: () => {
					this.type = 'uncross';
					this.typeShape = 'circle';
				}
			}, {
				icon: 'hint',
				action: () => {
					this.type = 'hint';
					this.typeShape = 'circle';
				}
			}, {
				icon: 'touch',
				action: () => {
					this.type = 'touch';
					this.typeShape = 'rect';
				}
			}, {
				icon: 'untouch',
				action: () => {
					this.type = 'untouch';
					this.typeShape = 'rect';
				}
			}
		]);

		this.type = 'cross';
		this.typeShape = 'circle';

		this.cell = 25;

		this._bindEvents();
	}
	_bindEvents() {
		$(document).contextmenu(false);
		$(window).resize(() => {
			this.paper.attr({
				width: window.innerWidth,
				height: window.innerHeight
			});
		});
		$(this.paper.node).mousedown((e) => {
			if(e.which === 1) this.addBody(e);
			if(e.which === 2) this.gui.nav.show(e);
			if(e.which === 3 && e.target != this.paper.node) {
				let p = e.target.parentNode;
				e.target.remove();

				for(let i = 0; i < p.children.length; i++) {
					p.children[i].id = i;
				}
			}
		});
		$(this.paper.node).mouseup((e) => {
			if(e.which === 1 && this.typeShape == 'rect') {
				this.paper.node.onmousemove = null;
			}
			if(e.which === 2) this.gui.nav.hide(e);
		});
		$('#completeBtn').click(() => {
			if(!$('#config').val()) {
				$('#config').val(JSON.stringify(this.generateCongif(), "", 4));
			} else {
				this.parseConfig(JSON.parse($('#config').val()));
				$('#config').val('');
			}
		});
		$('#deleteBtn').click(() => this.delete());
	}

	formatCell(x, y) {
		return {
			x: Math.round(x/this.cell)*this.cell, 
			y: Math.round(y/this.cell)*this.cell
		}
	}
	addBody(e) {
		if(this.typeShape == 'circle' && e.target.tagName == 'circle') return;

		var obj;
		if(this.typeShape === 'circle') {
			var pos = this.formatCell(e.clientX, e.clientY);
			obj = this.circles.circle(pos.x, pos.y, 25).attr({id: this.circles.node.children.length-1});

			obj.drag((dx, dy, x, y, event) => {
				obj.attr({
					cx: Math.round(x/this.cell)*this.cell,
					cy: Math.round(y/this.cell)*this.cell,
				});
			});		
		} else {
			obj = this.rects.rect(e.clientX, e.clientY, 0, 0).attr({id: this.rects.node.children.length-1});
			this.paper.node.onmousemove = function(event) {
				obj.attr({
					width: Math.max(0, event.clientX - e.clientX),
					height: Math.max(0, event.clientY - e.clientY)
				});
			}
		}

		obj.addClass(this.type);
	}

	generateCongif() {
		var conf = {
			label: $('#label').val(),
			intersections: +$('#intersections').val(),
			steps: +$('#steps').val(),
			clicks: +$('#clicks').val(),
			windows: {
				ru: [
					{
						label: 'LINES',
						text: $('#textWindowRU').val()
					}
				],
				en: [
					{
						label: 'LINES',
						text: $('#textWindowEN').val()
					}
				]
			}
		};
		conf.buttons = $('#isZ').prop("checked") ? 'RZ' : 'R';

		conf.objects = [];
		conf.hints = [];
		for(let i = 0; i < this.circles.node.children.length; i++) {
			var circle = this.circles.select('circle[id="' + i + '"]');

			if(circle.attr('class') !== 'hint')
				conf.objects.push({
					x: circle.attr('cx')-window.innerWidth/2,
					y: circle.attr('cy')-window.innerHeight/2,
					type: circle.attr('class')
				});
			else
				conf.hints.push({
					x: circle.attr('cx')-window.innerWidth/2,
					y: circle.attr('cy')-window.innerHeight/2,
				});
		}

		conf.areas = [];
		for(let i = 0; i < this.rects.node.children.length; i++) {
			var rect = this.rects.select('rect[id="' + i + '"]');

			conf.areas.push({
				x: rect.attr('x')-window.innerWidth/2,
				y: rect.attr('y')-window.innerHeight/2,
				w: +rect.attr('width'),
				h: +rect.attr('height'),
				type: rect.attr('class')
			});
		}
		return conf;
	}
	parseConfig(config) {
		this.delete();

		if(!config.hints) config.hints = [];
		if(!config.objects) config.objects = [];
		if(!config.areas) config.areas = [];

		$('#label').val(config.label);
		$('#intersections').val(config.intersections);
		$('#steps').val(config.steps);
		$('#clicks').val(config.clicks);
		$('#isZ').prop("checked", !!~config.buttons.indexOf('Z'));
		
		config.windows && $('#textWindowEN').val(config.windows.en[0].text);
		config.windows && $('#textWindowRU').val(config.windows.ru[0].text);

		for(let i = 0; i < config.objects.length; i++) {
			let obj = this.circles
						.circle(config.objects[i].x+window.innerWidth/2, config.objects[i].y+window.innerHeight/2, 0)
						.attr({id: this.circles.node.children.length-1})
						.addClass(config.objects[i].type);

			obj.drag((dx, dy, x, y, event) => {
				obj.attr({
					cx: Math.round(x/this.cell)*this.cell,
					cy: Math.round(y/this.cell)*this.cell,
				});
			});	
		}
		for(let i = 0; i < config.hints.length; i++) {
			let obj = this.circles
						.circle(config.hints[i].x+window.innerWidth/2, config.hints[i].y+window.innerHeight/2, 0)
						.attr({id: this.circles.node.children.length-1})
						.addClass('hint');

			obj.drag((dx, dy, x, y, event) => {
				obj.attr({
					cx: Math.round(x/this.cell)*this.cell,
					cy: Math.round(y/this.cell)*this.cell,
				});
			});
		}

		for(let i = 0; i < config.areas.length; i++) {
			this.rects
				.rect(config.areas[i].x+window.innerWidth/2, config.areas[i].y+window.innerHeight/2, config.areas[i].w, config.areas[i].h)
				.attr({id: this.rects.node.children.length-1})
				.addClass(config.areas[i].type)
		}
	}
	delete() {
		$('#label').val('');
		$('#intersections').val('');
		$('#steps').val('');
		$('#clicks').val('');
		$('#textWindowRU').val('');
		$('#textWindowEN').val('');
		$('#isZ').prop("checked", false);

		this.rects.remove();
		this.circles.remove();

		this.rects = this.constr.g().addClass('rects');
		this.circles = this.constr.g().addClass('circles');
	}
}

var constr = new Constructor();