define(function (require, exports, module) {
	'use strict';
	
	//定义DragComputation私有接口类开始
	function DragComputation() {
		this.node.dragComputation = function (part, pt, gridpt) {
			return this.data.onDragComputation(part, pt, gridpt);
		};
	}
	//定义DragComputation私有接口类结束

	module.exports = DragComputation;
});
