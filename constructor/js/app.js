class Constructor {
	constructor(game) {
		this.paper = Snap(window.innerWidth, window.innerHeight);
		this.rects = this.paper.svg(0, 0, window.innerWidth, window.innerHeight).addClass('rects');
		this.circles = this.paper.svg(0, 0, window.innerWidth, window.innerHeight).addClass('circles');

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

		this.cell = 50;

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
			if(e.which === 3 && e.target != this.paper.node) e.target.remove();
		});
		$(this.paper.node).mouseup((e) => {
			if(e.which === 1 && this.typeShape == 'rect') {
				this.paper.node.onmousemove = null;
			}
			if(e.which === 2) this.gui.nav.hide(e);
		});
		$('#completeBtn').click(this.generateCongif.bind(this));
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
			obj = this.circles.circle(pos.x, pos.y, 25).attr({id: this.circles.node.children.length});

			obj.drag(function(dx, dy, x, y, event) {
				this.attr({
					cx: Math.round(x/50)*50,
					cy: Math.round(y/50)*50,
				});
			});			
		} else {
			obj = this.rects.rect(e.clientX, e.clientY, 0, 0).attr({id: this.rects.node.children.length});
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
		};

		conf.objects = [];
		conf.hints = [];
		for(let i = 2; i < this.circles.node.children.length; i++) {
			var circle = this.circles.select('circle[id="' + (i+1) + '"]');

			if(circle.attr('class') !== 'hint')
				conf.objects.push({
					x: window.innerWidth/2-circle.attr('cx'),
					y: window.innerHeight/2-circle.attr('cy'),
					type: circle.attr('class')
				});
			else
				conf.hints.push({
					x: window.innerWidth/2-circle.attr('cx'),
					y: window.innerHeight/2-circle.attr('cy'),
				});
		}

		conf.areas = [];
		for(let i = 3; i < this.rects.node.children.length; i++) {
			var rect = this.rects.select('rect[id="' + (i+1) + '"]');

			conf.areas.push({
				x: window.innerWidth/2-rect.attr('x'),
				y: window.innerHeight/2-rect.attr('y'),
				w: +rect.attr('width'),
				h: +rect.attr('height'),
				type: rect.attr('class')
			});
		}
		console.log(conf);
		return conf;
	}
}

var constr = new Constructor();