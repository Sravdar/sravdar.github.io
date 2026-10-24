// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: x0 => new Int16Array(x0),
      AC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      AD: x0 => x0.clientX,
      AE: (x0,x1) => { x0.textContent = x1 },
      AF: x0 => x0.identifier,
      AG: x0 => x0.first(),
      AH: (x0,x1) => x0.add(x1),
      AI: x0 => x0.offsetWidth,
      AJ: x0 => x0.indexedDB,
      AK: x0 => x0.naturalWidth,
      AL: (x0,x1) => x0.send(x1),
      AM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      AN: x0 => x0.firstChild,
      AO: () => globalThis._flutter,
      B: s => printToConsole(s),
      BB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      BC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      BD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      BE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      BF: x0 => x0.touches,
      BG: x0 => x0.next(),
      BH: x0 => x0.data,
      BI: x0 => x0.stopPropagation(),
      BJ: x0 => x0.self,
      BK: (x0,x1) => x0.createElement(x1),
      BL: () => new Array(),
      BM: x0 => globalThis.showDirectoryPicker(x0),
      BN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: x0 => new Uint16Array(x0),
      CC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      CD: x0 => x0.getBoundingClientRect(),
      CE: x0 => x0.matches,
      CF: x0 => x0.pressure,
      CG: x0 => x0.current(),
      CH: (x0,x1) => { x0.scrollTop = x1 },
      CI: x0 => x0.disabled,
      CJ: (x0,x1) => x0.getRandomValues(x1),
      CK: (x0,x1) => { x0.pointerEvents = x1 },
      CL: (x0,x1) => new WebSocket(x0,x1),
      CM: x0 => globalThis.showSaveFilePicker(x0),
      CN: (x0,x1) => x0.item(x1),
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: x0 => new Int32Array(x0),
      DC: (x0,x1) => x0.querySelector(x1),
      DD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      DE: (x0,x1) => x0.matchMedia(x1),
      DF: x0 => x0.tiltY,
      DG: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      DH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      DI: (x0,x1) => { x0.min = x1 },
      DJ: () => globalThis.crypto,
      DK: (x0,x1) => { x0.height = x1 },
      DL: x0 => x0.reason,
      DM: (x0,x1) => x0.queryPermission(x1),
      DN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      EC: (x0,x1) => x0.item(x1),
      ED: s => new Date(s * 1000).getTimezoneOffset() * 60,
      EE: x0 => x0.matches,
      EF: x0 => x0.tiltX,
      EG: x0 => x0.v8BreakIterator,
      EH: (x0,x1) => { x0.value = x1 },
      EI: (x0,x1) => { x0.max = x1 },
      EJ: l => new DataView(new ArrayBuffer(l)),
      EK: (x0,x1) => { x0.width = x1 },
      EL: x0 => x0.code,
      EM: x0 => x0.clear(),
      EN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      F: () => new Error().stack,
      FB: x0 => new Uint32Array(x0),
      FC: x0 => x0.length,
      FD: Date.now,
      FE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      FF: x0 => x0.pointerType,
      FG: () => globalThis.Intl,
      FH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      FI: (x0,x1) => { x0.disabled = x1 },
      FJ: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      FK: x0 => x0.style,
      FL: x0 => x0.data,
      FM: (a, l) => a.length = l,
      FN: x0 => x0.name,
      G: s => JSON.stringify(s),
      GB: x0 => new Float32Array(x0),
      GC: (x0,x1) => x0.querySelectorAll(x1),
      GD: (handle) => clearTimeout(handle),
      GE: f => f.dartFunction,
      GF: x0 => x0.pointerId,
      GG: (x0,x1) => x0.segment(x1),
      GH: (x0,x1) => { x0.value = x1 },
      GI: (x0,x1) => { x0.scrollLeft = x1 },
      GJ: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      GK: (x0,x1) => { x0.src = x1 },
      GL: x0 => x0.readyState,
      GM: (x0,x1) => x0.transferFromImageBitmap(x1),
      GN: x0 => x0.parentNode,
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      HC: (x0,x1) => x0.getAttribute(x1),
      HD: (a, l) => a.length = l,
      HE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      HF: x0 => x0.getCoalescedEvents(),
      HG: x0 => x0.index,
      HH: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      HI: (x0,x1) => { x0.spellcheck = x1 },
      HJ: () => new XMLHttpRequest(),
      HK: () => globalThis.document,
      HL: (x0,x1) => { x0.binaryType = x1 },
      HM: (x0,x1) => x0.getContext(x1),
      HN: x0 => x0.length,
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Float64Array(x0),
      IC: x0 => x0.remove(),
      ID: (x0,x1) => x0.closest(x1),
      IE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      IF: (x0,x1) => x0.getModifierState(x1),
      IG: x0 => x0.next(),
      IH: x0 => x0.value,
      II: (x0,x1) => { x0.disabled = x1 },
      IJ: (x0,x1,x2) => x0.open(x1,x2),
      IK: x0 => x0.src,
      IL: x0 => ({recursive: x0}),
      IM: (x0,x1) => { x0.height = x1 },
      IN: x0 => x0.files,
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (x0,x1) => x0.appendChild(x1),
      JD: x0 => x0.bottom,
      JE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      JF: s => s.trimLeft(),
      JG: x0 => x0.value,
      JH: x0 => x0.selectionDirection,
      JI: (map, o, v) => map.set(o, v),
      JJ: (x0,x1) => x0.send(x1),
      JK: x0 => x0.decode(),
      JL: (x0,x1,x2) => x0.removeEntry(x1,x2),
      JM: (x0,x1) => { x0.width = x1 },
      JN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      K: o => String(o),
      KB: x0 => new ArrayBuffer(x0),
      KC: (x0,x1) => x0.append(x1),
      KD: x0 => x0.top,
      KE: (o, i) => o[i],
      KF: s => s.toUpperCase(),
      KG: x0 => x0.done,
      KH: x0 => x0.selectionStart,
      KI: (map, o) => map.get(o),
      KJ: x0 => x0.send(),
      KK: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      KL: x0 => ({create: x0}),
      KM: x0 => x0.height,
      KN: (x0,x1) => { x0.display = x1 },
      L: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      LB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      LC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      LD: x0 => x0.right,
      LE: o => o.length,
      LF: (x0,x1) => x0[x1],
      LG: (o, m, a) => o[m].apply(o, a),
      LH: x0 => x0.selectionEnd,
      LI: () => new WeakMap(),
      LJ: x0 => x0.abort(),
      LK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      LL: (x0,x1,x2) => x0.getDirectoryHandle(x1,x2),
      LM: x0 => x0.width,
      LN: x0 => x0.style,
      M: o => o === undefined,
      MB: (x0,x1,x2) => new DataView(x0,x1,x2),
      MC: x0 => x0.style,
      MD: x0 => x0.left,
      ME: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      MF: x0 => x0.length,
      MG: x0 => x0.iterator,
      MH: x0 => x0.value,
      MI: x0 => new WeakRef(x0),
      MJ: x0 => x0.readyState,
      MK: (x0,x1,x2) => x0.addEventListener(x1,x2),
      ML: x0 => x0.name,
      MM: x0 => x0.rasterEndMilliseconds,
      MN: (x0,x1) => { x0.accept = x1 },
      N: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      NB: (o, p) => o[p],
      NC: x0 => x0.debugShowSemanticsNodes,
      ND: x0 => x0.clientY,
      NE: x0 => x0.language,
      NF: (x0,x1) => x0.exec(x1),
      NG: () => globalThis.Symbol,
      NH: x0 => x0.selectionDirection,
      NI: x0 => x0.deref(),
      NJ: x0 => x0.upload,
      NK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NL: x0 => x0.kind,
      NM: x0 => x0.rasterStartMilliseconds,
      NN: (x0,x1) => { x0.multiple = x1 },
      O: (x0,x1) => x0.didCreateEngineInitializer(x1),
      OB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      OC: o => o,
      OD: x0 => x0.clientX,
      OE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      OF: x0 => x0.index,
      OG: (x0,x1) => new Intl.Segmenter(x0,x1),
      OH: x0 => x0.selectionStart,
      OI: () => globalThis.WeakRef,
      OJ: x0 => x0.responseURL,
      OK: x0 => x0.send(),
      OL: (x0,x1) => x0.getFileHandle(x1),
      OM: x0 => x0.imageBitmaps,
      ON: (x0,x1) => { x0.draggable = x1 },
      P: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      PC: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      PD: x0 => x0.changedTouches,
      PE: () => globalThis.window.FinalizationRegistry,
      PF: x0 => x0.pop(),
      PG: x0 => x0.Segmenter,
      PH: x0 => x0.selectionEnd,
      PI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      PJ: x0 => x0.statusText,
      PK: (x0,x1) => x0.revokeObjectURL(x1),
      PL: x0 => x0.getFile(),
      PM: x0 => x0.canvasKitMaximumSurfaces,
      PN: (x0,x1) => { x0.type = x1 },
      Q: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      QB: o => o.byteOffset,
      QC: (x0,x1) => x0.warn(x1),
      QD: x0 => x0.offsetY,
      QE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      QF: x0 => x0.flags,
      QG: x0 => x0.buffer,
      QH: x0 => x0.keyCode,
      QI: (a, s, e) => a.slice(s, e),
      QJ: x0 => x0.getAllResponseHeaders(),
      QK: (x0,x1) => { x0.src = x1 },
      QL: x0 => x0.text(),
      QM: x0 => x0.nextSibling,
      QN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      R: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      RB: o => o.buffer,
      RC: x0 => x0.console,
      RD: x0 => x0.offsetX,
      RE: x0 => new window.FinalizationRegistry(x0),
      RF: (a, s) => a.join(s),
      RG: x0 => x0.wasmMemory,
      RH: (x0,x1) => x0.scrollIntoView(x1),
      RI: (a, i) => a.splice(i, 1),
      RJ: x0 => x0.status,
      RK: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      RL: (x0,x1) => x0.getDirectoryHandle(x1),
      RM: (x0,x1) => x0.debug(x1),
      RN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      S: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      SB: Function.prototype.call.bind(DataView.prototype.getUint8),
      SC: () => globalThis.window,
      SD: x0 => x0.type,
      SE: (x0,x1) => x0.unregister(x1),
      SF: (x0,x1) => x0.error(x1),
      SG: () => globalThis.window._flutter_skwasmInstance,
      SH: x0 => x0.multiViewEnabled,
      SI: a => a.pop(),
      SJ: x0 => x0.response,
      SK: x0 => x0.naturalHeight,
      SL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      SM: x0 => x0.hostElement,
      SN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      T: x0 => new Promise(x0),
      TB: (b, o) => new DataView(b, o),
      TC: (o, c) => o instanceof c,
      TD: x0 => x0.maxTouchPoints,
      TE: (x0,x1) => x0.contains(x1),
      TF: () => globalThis.console,
      TG: () => new TextDecoder(),
      TH: (x0,x1) => x0.replaceWith(x1),
      TI: x0 => x0.back(),
      TJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      TK: x0 => x0.naturalWidth,
      TL: (x0,x1,x2) => x0.addEventListener(x1,x2),
      TM: x0 => x0.location,
      TN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      U: (x0,x1,x2) => x0.call(x1,x2),
      UB: (b, o, l) => new DataView(b, o, l),
      UC: (string, token) => string.split(token),
      UD: x0 => x0.platform,
      UE: (s) => +s,
      UF: s => s.trimRight(),
      UG: (d, digits) => d.toFixed(digits),
      UH: (x0,x1) => { x0.type = x1 },
      UI: x0 => x0.history,
      UJ: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      UK: x0 => x0.decode(),
      UL: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      UM: (x0,x1) => x0.getModifierState(x1),
      UN: (x0,x1) => { x0.ondragleave = x1 },
      V: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      VB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      VC: o => o instanceof Array,
      VD: x0 => x0.body,
      VE: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      VF: x0 => x0.blur(),
      VG: x0 => x0.maxHeight,
      VH: (x0,x1) => { x0.className = x1 },
      VI: () => globalThis.window,
      VJ: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      VK: (x0,x1) => { x0.decoding = x1 },
      VL: x0 => x0.preventDefault(),
      VM: x0 => x0.metaKey,
      VN: x0 => x0.clientY,
      W: x0 => new Array(x0),
      WB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      WC: (a, i) => a[i],
      WD: () => globalThis.document,
      WE: s => s.trim(),
      WF: x0 => x0.button,
      WG: x0 => x0.maxWidth,
      WH: (x0,x1) => { x0.tabIndex = x1 },
      WI: (x0,x1,x2) => x0.open(x1,x2),
      WJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      WK: (x0,x1) => { x0.crossOrigin = x1 },
      WL: (x0,x1) => { x0.returnValue = x1 },
      WM: x0 => x0.altKey,
      WN: x0 => x0.clientX,
      X: o => [o],
      XB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      XC: a => a.length,
      XD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      XE: x0 => x0.classList,
      XF: x0 => x0.innerHeight,
      XG: x0 => x0.minHeight,
      XH: (x0,x1) => { x0.name = x1 },
      XI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      XJ: x0 => x0.withCredentials,
      XK: (x0,x1) => x0.createObjectURL(x1),
      XL: o => o.byteLength,
      XM: x0 => x0.ctrlKey,
      XN: (x0,x1) => { x0.ondragover = x1 },
      Y: (o0, o1) => [o0, o1],
      YB: (t, s) => t.set(s),
      YC: (x0,x1) => x0.test(x1),
      YD: x0 => x0.hasFocus(),
      YE: x0 => x0.preventDefault(),
      YF: x0 => x0.innerWidth,
      YG: x0 => x0.minWidth,
      YH: (x0,x1) => { x0.placeholder = x1 },
      YI: (x0,x1) => x0.contains(x1),
      YJ: (x0,x1) => { x0.timeout = x1 },
      YK: x0 => x0.URL,
      YL: (x0,x1) => x0.createImageBitmap(x1),
      YM: x0 => x0.isComposing,
      YN: (x0,x1) => { x0.ondragenter = x1 },
      Z: (o0, o1, o2) => [o0, o1, o2],
      ZB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      ZC: x0 => x0.userAgent,
      ZD: x0 => x0.relatedTarget,
      ZE: x0 => x0.parent,
      ZF: x0 => x0.height,
      ZG: x0 => x0.debugSkipFontRetryDelay,
      ZH: (x0,x1) => { x0.autocomplete = x1 },
      ZI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ZJ: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      ZK: x0 => new Blob(x0),
      ZL: (x0,x1) => new OffscreenCanvas(x0,x1),
      ZM: x0 => x0.code,
      ZN: (x0,x1) => { x0.ondrop = x1 },
      a: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      aB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      aC: x0 => x0.navigator,
      aD: x0 => x0.shiftKey,
      aE: x0 => x0.timeStamp,
      aF: x0 => x0.width,
      aG: x0 => x0.status,
      aH: (x0,x1) => { x0.name = x1 },
      aI: (x0,x1) => x0.delete(x1),
      aJ: (x0,x1) => { x0.withCredentials = x1 },
      aK: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      aL: (x0,x1) => x0.getContext(x1),
      aM: x0 => x0.repeat,
      aN: x0 => x0.webkitGetAsEntry(),
      b: (x0,x1,x2) => { x0[x1] = x2 },
      bB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      bC: Function.prototype.call.bind(String.prototype.toLowerCase),
      bD: (decoder, codeUnits) => decoder.decode(codeUnits),
      bE: (x0,x1) => x0.hasAttribute(x1),
      bF: x0 => x0.clientHeight,
      bG: (x0,x1,x2) => x0.set(x1,x2),
      bH: (x0,x1) => { x0.placeholder = x1 },
      bI: (x0,x1,x2) => x0.put(x1,x2),
      bJ: (x0,x1) => { x0.responseType = x1 },
      bK: x0 => new window.ImageDecoder(x0),
      bL: (x0,x1,x2,x3,x4,x5) => x0.drawImage(x1,x2,x3,x4,x5),
      bM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      bN: x0 => x0.createReader(),
      c: o => o,
      cB: Function.prototype.call.bind(DataView.prototype.getUint32),
      cC: Object.is,
      cD: () => new TextDecoder("utf-8", {fatal: true}),
      cE: x0 => x0.buttons,
      cF: x0 => x0.clientWidth,
      cG: x0 => x0.arrayBuffer(),
      cH: (x0,x1) => { x0.action = x1 },
      cI: (x0,x1,x2) => x0.transaction(x1,x2),
      cJ: () => new FileReader(),
      cK: x0 => x0.name,
      cL: (x0,x1) => ({type: x0,quality: x1}),
      cM: x0 => x0.userAgent,
      cN: () => new Blob(),
      d: (o, p) => o[p],
      dB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      dC: x0 => x0.vendor,
      dD: () => new TextDecoder("utf-8", {fatal: false}),
      dE: x0 => x0.ctrlKey,
      dF: (x0,x1) => { x0.content = x1 },
      dG: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      dH: (x0,x1) => { x0.method = x1 },
      dI: (x0,x1) => x0.objectStore(x1),
      dJ: (x0,x1) => x0.readAsArrayBuffer(x1),
      dK: x0 => x0.repetitionCount,
      dL: (x0,x1) => x0.convertToBlob(x1),
      dM: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      dN: (x0,x1,x2,x3) => x0.slice(x1,x2,x3),
      e: () => globalThis,
      eB: Function.prototype.call.bind(DataView.prototype.getInt32),
      eC: (x0,x1) => x0.createTextNode(x1),
      eD: (a, i, v) => a[i] = v,
      eE: x0 => x0.y,
      eF: (x0,x1) => { x0.name = x1 },
      eG: (x0,x1) => x0.fetch(x1),
      eH: (x0,x1) => { x0.noValidate = x1 },
      eI: (x0,x1) => x0.getAll(x1),
      eJ: x0 => x0.result,
      eK: x0 => x0.frameCount,
      eL: x0 => x0.arrayBuffer(),
      eM: (x0,x1,x2,x3) => x0.decrypt(x1,x2,x3),
      eN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      f: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      fB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      fC: (x0,x1) => { x0.id = x1 },
      fD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      fE: x0 => x0.x,
      fF: x0 => x0.head,
      fG: x0 => x0.fontFallbackBaseUrl,
      fH: (x0,x1) => x0.removeAttribute(x1),
      fI: x0 => x0.value,
      fJ: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      fK: x0 => x0.selectedTrack,
      fL: x0 => x0.close(),
      fM: x0 => x0.isSecureContext,
      fN: (x0,x1) => x0.file(x1),
      g: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gB: o => o instanceof Uint16Array,
      gC: (x0,x1) => { x0.nonce = x1 },
      gD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      gE: x0 => x0.scrollTop,
      gF: (x0,x1) => x0.removeChild(x1),
      gG: (handle) => clearInterval(handle),
      gH: x0 => x0.isConnected,
      gI: x0 => x0.openCursor(),
      gJ: x0 => x0.type,
      gK: x0 => x0.completed,
      gL: x0 => x0.type,
      gM: (x0,x1,x2,x3,x4,x5,x6,x7) => x0.unwrapKey(x1,x2,x3,x4,x5,x6,x7),
      gN: x0 => x0.lastModified,
      h: (x0,x1) => ({addView: x0,removeView: x1}),
      hB: Function.prototype.call.bind(DataView.prototype.getUint16),
      hC: x0 => x0.nonce,
      hD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      hE: x0 => x0.offsetTop,
      hF: x0 => x0.firstChild,
      hG: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      hH: x0 => x0.click(),
      hI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      hJ: x0 => x0.vendor,
      hK: x0 => x0.ready,
      hL: (x0,x1) => { x0.imageSmoothingQuality = x1 },
      hM: (x0,x1,x2,x3,x4,x5) => x0.importKey(x1,x2,x3,x4,x5),
      hN: x0 => x0.fullPath,
      i: (l, r) => l === r,
      iB: o => o instanceof Int16Array,
      iC: () => globalThis.window.flutterConfiguration,
      iD: x0 => x0.visibilityState,
      iE: x0 => x0.scrollLeft,
      iF: x0 => x0.viewConstraints,
      iG: () => Date.now(),
      iH: (x0,x1) => x0.getElementsByClassName(x1),
      iI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      iJ: x0 => x0.navigator,
      iK: x0 => x0.tracks,
      iL: x0 => x0.height,
      iM: (x0,x1,x2,x3) => x0.generateKey(x1,x2,x3),
      iN: x0 => x0.name,
      j: x0 => x0.random(),
      jB: Function.prototype.call.bind(DataView.prototype.getInt16),
      jC: (x0,x1) => x0.attachShadow(x1),
      jD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      jE: x0 => x0.offsetLeft,
      jF: x0 => x0.hostElement,
      jG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      jH: (x0,x1) => x0.dispatchEvent(x1),
      jI: (x0,x1) => { x0.onerror = x1 },
      jJ: x0 => new Blob(x0),
      jK: x0 => x0.close(),
      jL: x0 => x0.width,
      jM: (x0,x1,x2,x3,x4) => x0.wrapKey(x1,x2,x3,x4),
      jN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      k: o => o,
      kB: o => o instanceof Uint8ClampedArray,
      kC: (x0,x1) => x0.createElement(x1),
      kD: x0 => x0.disconnect(),
      kE: x0 => x0.offsetParent,
      kF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      kG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      kH: (x0,x1) => x0.createEvent(x1),
      kI: x0 => x0.error,
      kJ: x0 => ({type: x0}),
      kK: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      kL: (x0,x1,x2) => x0.digest(x1,x2),
      kM: (x0,x1,x2) => x0.exportKey(x1,x2),
      kN: (x0,x1) => x0.readEntries(x1),
      l: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      lB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      lC: x0 => x0.scale,
      lD: x0 => new Intl.Locale(x0),
      lE: (o, p, r) => o.replace(p, () => r),
      lF: x0 => ({runApp: x0}),
      lG: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      lH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      lI: (x0,x1) => { x0.onsuccess = x1 },
      lJ: (x0,x1) => new Blob(x0,x1),
      lK: (x0,x1) => x0.decode(x1),
      lL: x0 => x0.subtle,
      lM: x0 => x0.localStorage,
      lN: x0 => x0.isDirectory,
      m: () => globalThis.Math,
      mB: Function.prototype.call.bind(DataView.prototype.setInt32),
      mC: x0 => x0.visualViewport,
      mD: x0 => x0.region,
      mE: (x0,x1) => { x0.lastIndex = x1 },
      mF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      mG: x0 => x0.history,
      mH: x0 => x0.readText(),
      mI: x0 => x0.continue(),
      mJ: x0 => globalThis.fetch(x0),
      mK: x0 => x0.displayHeight,
      mL: x0 => x0.crypto,
      mM: (x0,x1) => x0.getRandomValues(x1),
      mN: (x0,x1) => x0[x1],
      n: (x0,x1) => x0.prepend(x1),
      nB: Function.prototype.call.bind(DataView.prototype.setUint32),
      nC: x0 => x0.devicePixelRatio,
      nD: x0 => x0.script,
      nE: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      nF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      nG: x0 => x0.search,
      nH: x0 => x0.clipboard,
      nI: x0 => x0.result,
      nJ: x0 => x0.arrayBuffer(),
      nK: x0 => x0.displayWidth,
      nL: x0 => x0.size,
      nM: (x0,x1,x2,x3) => x0.encrypt(x1,x2,x3),
      nN: x0 => x0.length,
      o: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      oB: Function.prototype.call.bind(DataView.prototype.setInt16),
      oC: x0 => x0.height,
      oD: x0 => x0.language,
      oE: o => o instanceof RegExp,
      oF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      oG: x0 => x0.location,
      oH: (x0,x1) => x0.writeText(x1),
      oI: x0 => x0.target,
      oJ: (x0,x1,x2) => x0.setItem(x1,x2),
      oK: x0 => x0.duration,
      oL: x0 => globalThis.URL.createObjectURL(x0),
      oM: (x0,x1) => x0.querySelector(x1),
      oN: x0 => x0.items,
      p: b => !!b,
      pB: Function.prototype.call.bind(DataView.prototype.setUint16),
      pC: x0 => x0.width,
      pD: x0 => x0.languages,
      pE: x0 => x0.dotAll,
      pF: () => typeof dartUseDateNowForTicks !== "undefined",
      pG: x0 => x0.pathname,
      pH: x0 => x0.unlock(),
      pI: (x0,x1) => x0.getAllKeys(x1),
      pJ: (x0,x1) => x0.assign(x1),
      pK: x0 => x0.image,
      pL: (x0,x1) => x0.requestPermission(x1),
      pM: (x0,x1) => x0.createElement(x1),
      pN: x0 => x0.dataTransfer,
      q: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qB: Function.prototype.call.bind(DataView.prototype.setUint8),
      qC: x0 => x0.screen,
      qD: (x0,x1) => x0.observe(x1),
      qE: x0 => x0.unicode,
      qF: () => Date.now(),
      qG: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      qH: (x0,x1) => x0.lock(x1),
      qI: x0 => x0.key,
      qJ: x0 => x0.location,
      qK: () => globalThis.window.ImageDecoder,
      qL: (o, p, v) => o[p] = v,
      qM: (x0,x1) => x0.appendChild(x1),
      qN: x0 => x0.href,
      r: (x0,x1) => x0.focus(x1),
      rB: Function.prototype.call.bind(DataView.prototype.setInt8),
      rC: (string, times) => string.repeat(times),
      rD: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      rE: x0 => x0.ignoreCase,
      rF: () => 1000 * performance.now(),
      rG: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      rH: x0 => x0.orientation,
      rI: (o, t) => typeof o === t,
      rJ: x0 => x0.sessionStorage,
      rK: x0 => x0.status,
      rL: x0 => ({create: x0}),
      rM: x0 => x0.body,
      rN: x0 => x0.length,
      s: () => ({}),
      sB: Function.prototype.call.bind(DataView.prototype.getInt8),
      sC: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      sD: x0 => new ResizeObserver(x0),
      sE: x0 => x0.multiline,
      sF: (x0,x1) => x0.requestAnimationFrame(x1),
      sG: o => Object.keys(o),
      sH: (x0,x1) => x0.querySelector(x1),
      sI: x0 => x0.close(),
      sJ: (a, i, v) => a.splice(i, 0, v),
      sK: x0 => x0.response,
      sL: (x0,x1,x2) => x0.getFileHandle(x1,x2),
      sM: (x0,x1) => { x0.id = x1 },
      sN: x0 => x0.getReader(),
      t: (o, p, v) => o[p] = v,
      tB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      tC: x0 => x0.tabIndex,
      tD: (x0,x1) => x0.getPropertyValue(x1),
      tE: (o, p, r) => o.replaceAll(p, () => r),
      tF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tG: x0 => x0.state,
      tH: (x0,x1) => { x0.title = x1 },
      tI: (x0,x1) => x0.get(x1),
      tJ: (o, p) => p in o,
      tK: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      tL: x0 => x0.createWritable(),
      tM: () => globalThis.document,
      tN: x0 => x0.value,
      u: () => [],
      uB: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      uC: (x0,x1) => x0.contains(x1),
      uD: x0 => globalThis.parseFloat(x0),
      uE: x0 => x0.deltaMode,
      uF: x0 => x0.now(),
      uG: x0 => x0.hash,
      uH: (x0,x1) => x0.vibrate(x1),
      uI: (x0,x1) => x0.createObjectStore(x1),
      uJ: x0 => x0.groups,
      uK: (x0,x1) => { x0.responseType = x1 },
      uL: (x0,x1) => x0.write(x1),
      uM: x0 => x0.click(),
      uN: x0 => x0.done,
      v: (a, i) => a.push(i),
      vB: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      vC: x0 => x0.activeElement,
      vD: (x0,x1) => x0.getComputedStyle(x1),
      vE: x0 => x0.deltaY,
      vF: x0 => x0.performance,
      vG: x0 => x0.state,
      vH: x0 => x0.content,
      vI: x0 => x0.version,
      vJ: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      vK: () => new XMLHttpRequest(),
      vL: x0 => x0.close(),
      vM: x0 => globalThis.URL.revokeObjectURL(x0),
      vN: x0 => x0.read(),
      w: x0 => new Int8Array(x0),
      wB: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      wC: x0 => x0.parentNode,
      wD: x0 => x0.documentElement,
      wE: x0 => x0.deltaX,
      wF: x0 => new Uint8Array(x0),
      wG: (x0,x1) => x0.go(x1),
      wH: x0 => x0.document,
      wI: x0 => x0.objectStoreNames,
      wJ: (x0,x1) => x0.removeItem(x1),
      wK: x0 => x0.protocol,
      wL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      wM: (x0,x1) => { x0.download = x1 },
      wN: x0 => x0.body,
      x: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      xB: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      xC: x0 => x0.tagName,
      xD: x0 => x0.computedStyleMap(),
      xE: x0 => x0.wheelDeltaY,
      xF: (x0,x1,x2) => x0.slice(x1,x2),
      xG: x0 => x0.parentElement,
      xH: (x0,x1,x2) => x0.insertBefore(x1,x2),
      xI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      xJ: (x0,x1) => x0.getItem(x1),
      xK: (x0,x1,x2) => x0.close(x1,x2),
      xL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      xM: (x0,x1) => { x0.target = x1 },
      xN: (x0,x1) => new OffscreenCanvas(x0,x1),
      y: x0 => new Uint8Array(x0),
      yB: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      yC: x0 => x0.target,
      yD: (x0,x1) => x0.get(x1),
      yE: x0 => x0.wheelDeltaX,
      yF: (x0,x1) => x0.decode(x1),
      yG: (x0,x1) => x0.querySelectorAll(x1),
      yH: x0 => x0.id,
      yI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      yJ: (a, i) => a.splice(i, 1)[0],
      yK: (x0,x1) => x0.close(x1),
      yL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      yM: (x0,x1) => { x0.href = x1 },
      yN: x0 => x0.assetBase,
      z: x0 => new Uint8ClampedArray(x0),
      zB: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      zC: x0 => x0.clientY,
      zD: (o, p) => p in o,
      zE: x0 => x0.key,
      zF: (x0,x1) => x0.adoptText(x1),
      zG: (x0,x1) => x0.removeProperty(x1),
      zH: x0 => x0.offsetHeight,
      zI: (x0,x1) => { x0.onupgradeneeded = x1 },
      zJ: x0 => x0.naturalHeight,
      zK: x0 => x0.close(),
      zL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      zM: (x0,x1) => x0.removeChild(x1),
      zN: x0 => x0.loader,

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
