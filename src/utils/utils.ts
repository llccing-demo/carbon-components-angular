export function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}
// 判断目标元素 style 中是否有某个属性值，例如某个 dom 元素是否是 position: absolute;
function matchesAttr(el, attr, val) {
	const styles = window.getComputedStyle(el);
	return val.includes(styles[attr]);
}

export function closestAttr(s, t, element) {
	let el = element;

	if (!element) {
		return null;
	}

	do {
		if (matchesAttr(el, s, t)) {
			return el;
		}
		// 这里是逐级向上查找
		el = el.parentElement || el.parentNode;
	} while (el !== null && el.nodeType === 1);
	return null;
}
