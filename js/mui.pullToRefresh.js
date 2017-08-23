（function（$，window，document）{
	var STATE_BEFORECHANGEOFFSET ='beforeChangeOffset';
	var STATE_AFTERCHANGEOFFSET ='afterChangeOffset';

	var EVENT_PULLSTART ='pullstart';
	var EVENT_PULLING ='pull';
	var EVENT_BEFORECHANGEOFFSET = STATE_BEFORECHANGEOFFSET;
	var EVENT_AFTERCHANGEOFFSET = STATE_AFTERCHANGEOFFSET;
	var EVENT_DRAGENDAFTERCHANGEOFFSET ='dragEndAfterChangeOffset';

	var CLASS_TRANSITIONING = $ .className（'transitioning'）;
	var CLASS_PULL_TOP_TIPS = $ .className（'pull-top-tips'）;
	var CLASS_PULL_BOTTOM_TIPS = $ .className（'pull-bottom-tips'）;
	var CLASS_PULL_LOADING = $ .className（'pull-load'）;
	var CLASS_SCROLL = $ .className（'scroll'）;

	var CLASS_PULL_TOP_ARROW = $ .className（'pull-load'）+''+ $ .className（'icon'）+''+ $ .className（'icon-pulldown'）;
	var CLASS_PULL_TOP_ARROW_REVERSE = CLASS_PULL_TOP_ARROW +''+ $ .className（'reverse'）;
	var CLASS_PULL_TOP_SPINNER = $ .className（'pull-load'）+''+ $ .className（'spinner'）;
	var CLASS_HIDDEN = $ .className（'hidden'）;

	var SELECTOR_PULL_LOADING ='。' + CLASS_PULL_LOADING;
	$ .PullToRefresh = $ .Class.extend（{
		init：function（element，options）{
			this.element = element;
			this.options = $ .extend（true，{
				下： {
					身高：75，
					回调：false，
				}，
				up：{
					auto：false，
					偏移量：100，//距离底部高度（到达该高度即触发）
					显示：真，
					contentdown：'上拉显示更多'，
					contentrefresh：'正在加载...'
					contentnomore：'没有更多数据了'，
					回调：false
				}，
				preventDefaultException：{
					tagName：/ ^（INPUT | TEXTAREA | BUTTON | SELECT）$ /
				}
			}，选项）;
			this.stopped = this.isNeedRefresh = this.isDragging = false;
			this.state = STATE_BEFORECHANGEOFFSET;
			this.isInScroll = this.element.classList.contains（CLASS_SCROLL）;
			this.initPullUpTips（）;

			this.initEvent（）;
		}，
		_preventDefaultException：function（el，exceptions）{
			for（var i in exceptions）{
				if（exceptions [i] .test（el [i]））{
					返回真
				}
			}
			返回假
		}，
		initEvent：function（）{
			if（$ .isFunction（this.options.down.callback））{
				this.element.addEventListener（'touchstart'，this）;
				this.element.addEventListener（'drag'，this）;
				this.element.addEventListener（'dragend'，this）;
			}
			if（this.pullUpTips）{
				this.element.addEventListener（'dragup'，this）;
				if（this.isInScroll）{
					this.element.addEventListener（'scrollbottom'，this）;
				} else {
					window.addEventListener（'scroll'，this）;
				}
			}
		}，
		handleEvent：function（e）{
			开关（e.type）{
				case'touchstart'：
					this.isInScroll && this._canPullDown（）&& e.target &&！this._preventDefaultException（e.target，this.options.preventDefaultException）&& e.preventDefault（）;
					打破;
				case'drag'：
					this._drag（E）;
					打破;
				case'dragend'：
					this._dragend（E）;
					打破;
				case'webkitTransitionEnd'：
					this._transitionEnd（E）;
					打破;
				case'dragup'：
				case'scroll'：
					this._dragup（E）;
					打破;
				case'scrollbottom'：
					this.pullUpLoading（E）;
					打破;
			}
		}，
		initPullDownTips：function（）{
			var self = this;
			if（$ .isFunction（self.options.down.callback））{
				self.pullDownTips =（function（）{
					var element = document.querySelector（'。'+ CLASS_PULL_TOP_TIPS）;
					if（element）{
						element.parentNode.removeChild（元件）;
					}
					if（！element）{
						element = document.createElement（'div'）;
						element.classList.add（CLASS_PULL_TOP_TIPS）;
						element.innerHTML ='<div class =“mui-pull-top-wrapper”> <span class =“mui-pull-loading mui-icon mui-icon-pulldown”> </ span> </ div>';
						element.addEventListener（'webkitTransitionEnd'，self）;
					}
					self.pullDownTipsIcon = element.querySelector（SELECTOR_PULL_LOADING）;
					document.body.appendChild（元件）;
					返回元素
				}（））;
			}
		}，
		initPullUpTips：function（）{
			var self = this;
			if（$ .isFunction（self.options.up.callback））{
				self.pullUpTips =（function（）{
					var element = self.element.querySelector（'。'+ CLASS_PULL_BOTTOM_TIPS）;
					if（！element）{
						element = document.createElement（'div'）;
						element.classList.add（CLASS_PULL_BOTTOM_TIPS）;
						if（！self.options.up.show）{
							element.classList.add（CLASS_HIDDEN）;
						}
						element.innerHTML ='<div class =“mui-pull-bottom-wrapper”> <span class =“mui-pull-loading”>'+ self.options.up.contentdown +'</ span> </ div> “;
						self.element.appendChild（元件）;
					}
					self.pullUpTipsIcon = element.querySelector（SELECTOR_PULL_LOADING）;
					返回元素
				}（））;
			}
		}，
		_transitionEnd：function（e）{
			if（e.target === this.pullDownTips && this.removing）{
				this.removePullDownTips（）;
			}
		}，
		_dragup：function（e）{
			var self = this;
			if（self.loading）{
				返回;
			}
			if（e && e.detail && $ .gestures.session.drag）{
				self.isDraggingUp = true;
			} else {
				if（！self.isDraggingUp）{//滚动事件
					返回;
				}
			}
			if（！self.isDragging）{
				if（self._canPullUp（））{
					self.pullUpLoading（E）;
				}
			}
		}，
		_canPullUp：function（）{
			if（this.removing）{
				返回假
			}
			if（this.isInScroll）{
				var scrollId = this.element.parentNode.getAttribute（'data-scroll'）;
				if（scrollId）{
					var scrollApi = $ .data [scrollId];
					return scrollApi.y === scrollApi.maxScrollY;
				}
			}
			return window.pageYOffset + window.innerHeight + this.options.up.offset> = document.documentElement.scrollHeight;
		}，
		_canPullDown：function（）{
			if（this.removing）{
				返回假
			}
			if（this.isInScroll）{
				var scrollId = this.element.parentNode.getAttribute（'data-scroll'）;
				if（scrollId）{
					var scrollApi = $ .data [scrollId];
					return scrollApi.y === 0;
				}
			}
			return document.body.scrollTop === 0;
		}，
		_drag：function（e）{
			if（this.loading || this.stopped）{
				e.stopPropagation（）;
				e.detail.gesture.preventDefault（）;
				返回;
			}
			var detail = e.detail;
			if（！this.isDragging）{
				if（detail.direction ==='down'&& this._canPullDown（））{
					if（document.querySelector（'。'+ CLASS_PULL_TOP_TIPS））{
						e.stopPropagation（）;
						e.detail.gesture.preventDefault（）;
						返回;
					}
					this.isDragging = true;
					this.removing = false;
					this.startDeltaY = detail.deltaY;
					$ .gestures.session.lockDirection = true; //锁定方向
					$ .gestures.session.startDirection = detail.direction;
					this._pullStart（this.startDeltaY）;
				}
			}
			if（this.isDragging）{
				e.stopPropagation（）;
				e.detail.gesture.preventDefault（）;
				var deltaY = detail.deltaY  -  this.startDeltaY;
				deltaY = Math.min（deltaY，1.5 * this.options.down.height）;
				this.deltaY = deltaY;
				this._pulling（移动deltaY）;
				var state = deltaY> this.options.down.height？STATE_AFTERCHANGEOFFSET：STATE_BEFORECHANGEOFFSET;
				if（this.state！== state）{
					this.state = state;
					if（this.state === STATE_AFTERCHANGEOFFSET）{
						this.removing = false;
						this.isNeedRefresh = true;
					} else {
						this.removing = true;
						this.isNeedRefresh = false;
					}
					这个['_'+状态]（deltaY）;
				}
				if（$ .os.ios && parseFloat（$。os.version）> = 8）{
					var clientY = detail.gesture.touches [0] .clientY;
					if（（clientY + 10）> window.innerHeight || clientY <10）{
						this._dragend（E）;
						返回;
					}
				}
			}
		}，
		_dragend：function（e）{
			var self = this;
			if（self.isDragging）{
				self.isDragging = false;
				self._dragEndAfterChangeOffset（self.isNeedRefresh）;
			}
			if（self.isPullingUp）{
				if（self.pullingUpTimeout）{
					clearTimeout（self.pullingUpTimeout）;
				}
				self.pullingUpTimeout = setTimeout（function（）{
					self.isPullingUp = false;
				}，1000）;
			}
		}，
		_pullStart：function（startDeltaY）{
			this.pullStart（startDeltaY）;
			$ .trigger（this.element，EVENT_PULLSTART，{
				api：这个，
				startDeltaY：startDeltaY
			}）;
		}，
		_pulling：function（deltaY）{
			this.pulling（移动deltaY）;
			$ .trigger（this.element，EVENT_PULLING，{
				api：这个，
				deltaY：deltaY
			}）;
		}，
		_beforeChangeOffset：function（deltaY）{
			this.beforeChangeOffset（移动deltaY）;
			$ .trigger（this.element，EVENT_BEFORECHANGEOFFSET，{
				api：这个，
				deltaY：deltaY
			}）;
		}，
		_afterChangeOffset：function（deltaY）{
			this.afterChangeOffset（移动deltaY）;
			$ .trigger（this.element，EVENT_AFTERCHANGEOFFSET，{
				api：这个，
				deltaY：deltaY
			}）;
		}，
		_dragEndAfterChangeOffset：function（isNeedRefresh）{
			this.dragEndAfterChangeOffset（isNeedRefresh）;
			$ .trigger（this.element，EVENT_DRAGENDAFTERCHANGEOFFSET，{
				api：这个，
				isNeedRefresh：isNeedRefresh
			}）;
		}，
		removePullDownTips：function（）{
			if（this.pullDownTips）{
				尝试{
					this.pullDownTips.parentNode && this.pullDownTips.parentNode.removeChild（this.pullDownTips）;
					this.pullDownTips = null;
					this.removing = false;
				} catch（e）{}
			}
		}，
		pullStart：function（startDeltaY）{
			this.initPullDownTips（startDeltaY）;
		}，
		拉：功能（deltaY）{
			this.pullDownTips.style.webkitTransform ='translate3d（0，'+ deltaY +'px，0）';
		}，
		beforeChangeOffset：function（deltaY）{
			this.pullDownTipsIcon.className = CLASS_PULL_TOP_ARROW;
		}，
		afterChangeOffset：function（deltaY）{
			this.pullDownTipsIcon.className = CLASS_PULL_TOP_ARROW_REVERSE;
		}，
		dragEndAfterChangeOffset：function（isNeedRefresh）{
			if（isNeedRefresh）{
				this.pullDownTipsIcon.className = CLASS_PULL_TOP_SPINNER;
				this.pullDownLoading（）;
			} else {
				this.pullDownTipsIcon.className = CLASS_PULL_TOP_ARROW;
				this.endPullDownToRefresh（）;
			}
		}，
		pullDownLoading：function（）{
			if（this.loading）{
				返回;
			}
			if（！this.pullDownTips）{
				this.initPullDownTips（）;
				this.dragEndAfterChangeOffset（真）;
				返回;
			}
			this.loading = true;
			this.pullDownTips.classList.add（CLASS_TRANSITIONING）;
			this.pullDownTips.style.webkitTransform ='translate3d（0，'+ this.options.down.height +'px，0）';
			this.options.down.callback.apply（本）;
		}，
		pullUpLoading：function（e）{
			if（this.loading || this.finished）{
				返回;
			}
			this.loading = true;
			this.isDraggingUp = false;
			this.pullUpTips.classList.remove（CLASS_HIDDEN）;
			e && e.detail && e.detail.gesture && e.detail.gesture.preventDefault（）;
			this.pullUpTipsIcon.innerHTML = this.options.up.contentrefresh;
			this.options.up.callback.apply（本）;
		}，
		endPullDownToRefresh：function（）{
			this.loading = false;
			this.pullUpTips && this.pullUpTips.classList.remove（CLASS_HIDDEN）;
			this.pullDownTips.classList.add（CLASS_TRANSITIONING）;
			this.pullDownTips.style.webkitTransform ='translate3d（0,0,0）';
			if（this.deltaY <= 0）{
				this.removePullDownTips（）;
			} else {
				this.removing = true;
			}
		}，
		endPullUpToRefresh：function（finished）{
			if（finished）{
				this.finished = true;
				this.pullUpTipsIcon.innerHTML = this.options.up.contentnomore;
				this.element.removeEventListener（'dragup'，this）;
				window.removeEventListener（'scroll'，this）;
			} else {
				this.pullUpTipsIcon.innerHTML = this.options.up.contentdown;
			}
			this.loading = false;
		}，
		setStopped：function（stopped）{
			if（stopped！= this.stopped）{
				this.stopped = stopped;
				this.pullUpTips && this.pullUpTips.classList [stopped？'add'：'remove']（CLASS_HIDDEN）;
			}
		}，
		refresh：function（isReset）{
			if（isReset && this.finished && this.pullUpTipsIcon）{
				this.pullUpTipsIcon.innerHTML = this.options.up.contentdown;
				this.element.addEventListener（'dragup'，this）;
				window.addEventListener（'scroll'，this）;
				this.finished = false;
			}
		}
	}）;
	$ .fn.pullToRefresh = function（options）{
		var pullRefreshApis = [];
		options = options || {};
		this.each（function（）{
			var self = this;
			var pullRefreshApi = null;
			var id = self.getAttribute（'data-pullToRefresh'）;
			if（！id）{
				id = ++ $。uuid;
				$ .data [id] = pullRefreshApi = new $ .PullToRefresh（self，options）;
				self.setAttribute（'data-pullToRefresh'，id）;
			} else {
				pullRefreshApi = $ .data [id];
			}
			if（options.up && options.up.auto）{//如果设置了auto，则自动上拉一次
				pullRefreshApi.pullUpLoading（）;
			}
			pullRefreshApis.push（pullRefreshApi）;
		}）;
		return pullRefreshApis.length === 1？pullRefreshApis [0]：pullRefreshApis;
	}
}）（mui，window，document）;