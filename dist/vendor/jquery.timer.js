!function(t){jQuery.timer=function(i,e,s){var s=jQuery.extend({reset:500},s),i=i||s.reset;return!!e&&new function(i,e,r){this.internalCallback=function(){e(n)},this.stop=function(){return!(1!==this.state||!this.id)&&(clearInterval(n.id),this.state=0,!0)},this.reset=function(i){n.id&&clearInterval(n.id);var i=i||s.reset;return this.id=setInterval(t.proxy(this.internalCallback,this),i),this.state=1,!0},this.pause=function(){return!(!n.id||1!==this.state)&&(clearInterval(this.id),this.state=2,!0)},this.resume=function(){return 2===this.state&&(this.state=1,this.id=setInterval(t.proxy(this.internalCallback,this),this.interval),!0)},this.interval=i,r||(this.id=setInterval(t.proxy(this.internalCallback,this),this.interval),this.state=1);var n=this}(i,e,s.disabled)}}(jQuery);