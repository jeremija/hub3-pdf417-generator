window.addEventListener('load', () => {
  function load(text) {
    const values = JSON.parse(text)
    for (const el of document.getElementById('params').elements) {
      if (el.name && values[el.name]) {
        el.value = values[el.name]
      }
    }
  }

  try {
    load(localStorage.getItem('form'))
  } catch (err) {
    // console.error('Error reading values:', err)
  }

  const templateFile = document.getElementById('template-file')
  const templateSave = document.getElementById('template-save')
  const templateLoad = document.getElementById('template-load')

  templateFile.addEventListener('change', e => {
    const reader = new FileReader()
    const file = e.target.files[0]
    console.log('file', file)
    reader.onload = e => {
      console.log(e.target.result)
      load(e.target.result)
    }
    reader.readAsText(file)
  })

  templateLoad.addEventListener('click', e => {
    e.preventDefault()
    e.stopPropagation()
    templateFile.click()
  })

  // Allow Enter to render
  document.getElementById('params').addEventListener('submit', ev => {
    ev.preventDefault()
    ev.stopPropagation()

    const elements = ev.target.elements
    const values = {}
    for (const el of elements) {
      if (el.name) {
        values[el.name] = el.value
      }
    }

    const serialized = JSON.stringify(values)
    localStorage.setItem('form', serialized)
    templateSave.href = 'data:application/json,' + encodeURIComponent(serialized)
    templateSave.download = values.payeeName + '.json'

    const text = getText(values)
    render(text)
  });
});

function addValue(fields, value, maxlength) {
  fields.push(value.substring(0, maxlength))
}

function getText(values) {
  let fields = []

  let amount = Math.round(((+values.amount) * 100)).toFixed(0)
  while (amount.length < 15) {
    amount = '0' + amount
  }

  addValue(fields, values.header, 8)
  addValue(fields, values.currency, 3)
  addValue(fields, amount, 15)
  addValue(fields, values.payerName, 30)
  addValue(fields, values.payerAddress, 27)
  addValue(fields, values.payerCity, 27)
  addValue(fields, values.payeeName, 25)
  addValue(fields, values.payeeAddress, 25)
  addValue(fields, values.payeeCity, 27)
  addValue(fields, values.iban, 21)
  addValue(fields, values.model, 4)
  addValue(fields, values.ref, 22)
  addValue(fields, values.purpose, 4)
  addValue(fields, values.desc, 35)

  return fields.join('\n') + '\n'
}

function render(text) {
  const scaleX = 2
  const scaleY = 2

  document.getElementById('rawcontent').innerHTML = text
  // document.getElementById('content').innerHTML = text.replace(/\r/g, '&lt;LF&gt;\n')
  // Clear the page
  document.getElementById('target').innerHTML = '';
  document.getElementById('output').textContent = '';

  const opts = {}
  // Finish up the options object.
  opts.text = text;
  opts.bcid = 'pdf417';
  opts.scaleX = scaleX;
  opts.scaleY = scaleY;

  // Draw the bar code with an SVG drawing object.
  try {
    // fixupOptions() modifies options values (currently padding and
    // background color) to provide a simplified interface for the
    // drawing code.
    bwipjs.fixupOptions(opts);

    // The drawing needs FontLib to extract glyph paths
    var svg = bwipjs.render(opts, DrawingSVG(opts, bwipjs.FontLib));

    document.getElementById('target').innerHTML   = svg;
    document.getElementById('output').textContent = svg;
    document.getElementById('download').href = 'data:image/svg+xml,' + svg
  } catch (e) {
    // Watch for BWIPP generated raiseerror's.
    var msg = (''+e).trim();
    if (msg.indexOf("bwipp.") >= 0) {
      document.getElementById('output').textContent = msg;
    } else if (e.stack) {
      // GC includes the message in the stack.  FF does not.
      document.getElementById('output').textContent =
          (e.stack.indexOf(msg) == -1 ? msg + '\n' : '') + e.stack;
    } else {
      document.getElementById('output').textContent = msg;
    }
  }
}
