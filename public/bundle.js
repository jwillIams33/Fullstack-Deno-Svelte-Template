
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.29.0 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (110:6) {#each todoItems as todo (todo.id)}
    function create_each_block(key_1, ctx) {
    	let li;
    	let input;
    	let input_id_value;
    	let t0;
    	let label;
    	let label_for_value;
    	let t1;
    	let span;
    	let t2_value = /*todo*/ ctx[9].text + "";
    	let t2;
    	let t3;
    	let button;
    	let svg;
    	let use;
    	let t4;
    	let li_class_value;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[5](/*todo*/ ctx[9], ...args);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[6](/*todo*/ ctx[9], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			button = element("button");
    			svg = svg_element("svg");
    			use = svg_element("use");
    			t4 = space();
    			attr_dev(input, "id", input_id_value = /*todo*/ ctx[9].id);
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file, 111, 10, 2585);
    			attr_dev(label, "for", label_for_value = /*todo*/ ctx[9].id);
    			attr_dev(label, "class", "tick");
    			add_location(label, file, 112, 10, 2634);
    			add_location(span, file, 113, 10, 2724);
    			attr_dev(use, "href", "#delete-icon");
    			add_location(use, file, 115, 17, 2842);
    			add_location(svg, file, 115, 12, 2837);
    			attr_dev(button, "class", "delete-todo");
    			add_location(button, file, 114, 10, 2759);
    			attr_dev(li, "class", li_class_value = "todo-item " + (/*todo*/ ctx[9].checked ? "done" : ""));
    			add_location(li, file, 110, 8, 2523);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, input);
    			append_dev(li, t0);
    			append_dev(li, label);
    			append_dev(li, t1);
    			append_dev(li, span);
    			append_dev(span, t2);
    			append_dev(li, t3);
    			append_dev(li, button);
    			append_dev(button, svg);
    			append_dev(svg, use);
    			append_dev(li, t4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(label, "click", click_handler, false, false, false),
    					listen_dev(button, "click", click_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*todoItems*/ 1 && input_id_value !== (input_id_value = /*todo*/ ctx[9].id)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*todoItems*/ 1 && label_for_value !== (label_for_value = /*todo*/ ctx[9].id)) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty & /*todoItems*/ 1 && t2_value !== (t2_value = /*todo*/ ctx[9].text + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*todoItems*/ 1 && li_class_value !== (li_class_value = "todo-item " + (/*todo*/ ctx[9].checked ? "done" : ""))) {
    				attr_dev(li, "class", li_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(110:6) {#each todoItems as todo (todo.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div1;
    	let h1;
    	let t1;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let div0;
    	let svg;
    	let use;
    	let t3;
    	let h2;
    	let t5;
    	let p;
    	let t7;
    	let form;
    	let input;
    	let mounted;
    	let dispose;
    	let each_value = /*todoItems*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*todo*/ ctx[9].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "todos";
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div0 = element("div");
    			svg = svg_element("svg");
    			use = svg_element("use");
    			t3 = space();
    			h2 = element("h2");
    			h2.textContent = "Add your first todo";
    			t5 = space();
    			p = element("p");
    			p.textContent = "What do you want to get done today?";
    			t7 = space();
    			form = element("form");
    			input = element("input");
    			attr_dev(h1, "class", "app-title");
    			add_location(h1, file, 107, 4, 2413);
    			attr_dev(ul, "class", "todo-list");
    			add_location(ul, file, 108, 4, 2450);
    			attr_dev(use, "href", "#checklist-icon");
    			add_location(use, file, 121, 34, 3002);
    			attr_dev(svg, "class", "checklist-icon");
    			add_location(svg, file, 121, 6, 2974);
    			attr_dev(h2, "class", "empty-state__title");
    			add_location(h2, file, 122, 6, 3049);
    			attr_dev(p, "class", "empty-state__description");
    			add_location(p, file, 123, 6, 3111);
    			attr_dev(div0, "class", "empty-state");
    			add_location(div0, file, 120, 4, 2942);
    			attr_dev(input, "class", "js-todo-input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "aria-label", "Enter a new todo item");
    			attr_dev(input, "placeholder", "E.g. Build a web app");
    			add_location(input, file, 126, 6, 3250);
    			add_location(form, file, 125, 4, 3202);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file, 106, 2, 2385);
    			add_location(main, file, 105, 0, 2376);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, use);
    			append_dev(div0, t3);
    			append_dev(div0, h2);
    			append_dev(div0, t5);
    			append_dev(div0, p);
    			append_dev(div1, t7);
    			append_dev(div1, form);
    			append_dev(form, input);
    			set_input_value(input, /*newTodo*/ ctx[1]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[7]),
    					listen_dev(form, "submit", prevent_default(/*addTodo*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*todoItems, deleteTodo, toggleDone*/ 25) {
    				const each_value = /*todoItems*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, destroy_block, create_each_block, null, get_each_context);
    			}

    			if (dirty & /*newTodo*/ 2 && input.value !== /*newTodo*/ ctx[1]) {
    				set_input_value(input, /*newTodo*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	onMount(() => {
    		fetch("http://localhost:4000/API/tasks").then(res => {
    			if (!res.ok) {
    				throw new Error("Failed!");
    			}

    			return res.json();
    		}).then(data => {
    			backEndData = Object.values(data.todos);

    			let newData = backEndData.map(function (el) {
    				let newObj = {
    					id: el._id.$oid,
    					text: el.name.text,
    					checked: el.name.checked
    				};

    				return newObj;
    			});

    			$$invalidate(0, todoItems = newData);
    		}).catch(err => {
    			console.log(err);
    		});
    	});

    	afterUpdate(() => {
    		document.querySelector(".js-todo-input").focus();
    	});

    	let todoItems = [];
    	let newTodo = "";
    	let backEndData = [];

    	function addTodo() {
    		$$invalidate(1, newTodo = newTodo.trim());
    		if (!newTodo) return;

    		const todo = {
    			text: newTodo,
    			checked: false,
    			id: Date.now()
    		};

    		$$invalidate(0, todoItems = [...todoItems, todo]);
    		$$invalidate(1, newTodo = "");

    		fetch("http://localhost:4000/API/tasks/", {
    			method: "POST",
    			body: JSON.stringify(todo),
    			headers: { "Content-Type": "application/json" }
    		}).then(res => {
    			if (!res.ok) {
    				throw new Error("Failed!");
    			} else {
    				location.reload();
    			}
    		}).catch(err => {
    			console.log(err);
    		});
    	}

    	function toggleDone(id) {
    		const index = todoItems.findIndex(item => item.id === id);
    		const todo = { name: todoItems[index] };
    		$$invalidate(0, todoItems[index].checked = !todoItems[index].checked, todoItems);

    		fetch(`http://localhost:4000/API/tasks/${id}`, {
    			method: "PUT",
    			body: JSON.stringify(todo),
    			headers: { "Content-Type": "application/json" }
    		}).then(res => {
    			if (!res.ok) {
    				throw new Error("Failed!");
    			}
    		}).catch(err => {
    			console.log(err);
    		});
    	} // location.reload();

    	function deleteTodo(id) {
    		$$invalidate(0, todoItems = todoItems.filter(item => item.id !== id));

    		fetch(`http://localhost:4000/API/tasks/${id}`, {
    			method: "DELETE",
    			body: "ITEM DELETED",
    			headers: { "Content-Type": "application/json" }
    		}).then(res => {
    			if (!res.ok) {
    				throw new Error("Failed!");
    			}
    		}).catch(err => {
    			console.log(err);
    		});

    		location.reload();
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = todo => toggleDone(todo.id);
    	const click_handler_1 = todo => deleteTodo(todo.id);

    	function input_input_handler() {
    		newTodo = this.value;
    		$$invalidate(1, newTodo);
    	}

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		onMount,
    		todoItems,
    		newTodo,
    		backEndData,
    		addTodo,
    		toggleDone,
    		deleteTodo
    	});

    	$$self.$inject_state = $$props => {
    		if ("todoItems" in $$props) $$invalidate(0, todoItems = $$props.todoItems);
    		if ("newTodo" in $$props) $$invalidate(1, newTodo = $$props.newTodo);
    		if ("backEndData" in $$props) backEndData = $$props.backEndData;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		todoItems,
    		newTodo,
    		addTodo,
    		toggleDone,
    		deleteTodo,
    		click_handler,
    		click_handler_1,
    		input_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
