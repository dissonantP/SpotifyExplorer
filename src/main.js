import './style.scss'

const categoryName = (item, variant) => {
  if (['Intro', 'Sound', 'Pulse', 'Edge'].includes(variant)) return 'genres'
  if (['Current', 'Emerging', 'Underground', 'Needle'].includes(variant)) return 'places'
  return 'other'
}

const baseName = (item) => {
  if (['The Needle', 'The Needle - Current', 'The Needle - Emerging', 'The Needle - Underground'].includes(item.name))
    return 'The Needle'
  return item.name
    .replace('The Sound of ', '')
    .replace('The Pulse of ', '')
    .replace('The Edge of ', '')
    .replace('Intro to ', '')
    .replace('The Needle', '')
    .replace(' - Current', '')
    .replace(' - Emerging', '')
    .replace(' - Underground', '')
    .replace(' / ', '')
}

const variantName = (item) => {
  if (item.name.startsWith('The Sound of')) return 'Sound'
  if (item.name.startsWith('The Pulse of')) return 'Pulse'
  if (item.name.startsWith('The Edge of')) return 'Edge'
  if (item.name.startsWith('The Needle')) {
    if (item.name.endsWith(' - Current')) return 'Current'
    if (item.name.endsWith(' - Emerging')) return 'Emerging'
    if (item.name.endsWith(' - Underground')) return 'Underground'
    return 'Needle'
  }
  if (item.name.startsWith('Intro to')) return 'Intro'
  return 'Link'
}

const groupData = (raw) => {
  const groups = {}
  raw.forEach((item) => {
    const variant = variantName(item)
    const category = (groups[categoryName(item, variant)] ??= {})
    const variants = (category[baseName(item)] ??= {})
    variants[variant] = item
  })
  return groups
}

const renderData = (data) => {
  document.getElementById('loading').remove()
  Object.entries(data).forEach(([category, categoryItems]) => {
    Object.entries(categoryItems).forEach(([base, variants]) => {
      const li = document.createElement('li')
      li.className = 'item'
      li.dataset.category = category

      const nameSpan = document.createElement('span')
      nameSpan.className = 'name'
      nameSpan.textContent = base
      li.appendChild(nameSpan)

      const variantsDiv = document.createElement('div')
      variantsDiv.className = 'variants'
      Object.entries(variants).forEach(([vName, item]) => {
        const a = document.createElement('a')
        a.className = 'variant'
        a.href = item.uri
        a.target = '_blank'
        a.textContent = vName
        variantsDiv.appendChild(a)
      })
      li.appendChild(variantsDiv)

      document.querySelector(`.${category}`).appendChild(li)
    })
  })
}

const setupFilters = () => {
  document.querySelector('#search-filter form').addEventListener('submit', (e) => {
    e.preventDefault()
    const items = document.querySelectorAll('#content .item')
    const search = document.querySelector("#search-filter input[type='text']").value
    if (search.length > 0) {
      const tokens = search.split(' ')
      items.forEach((item) => {
        const text = item.querySelector('.name').textContent.toLowerCase()
        item.style.display = tokens.every((t) => text.includes(t.toLowerCase())) ? '' : 'none'
      })
    } else {
      items.forEach((item) => { item.style.display = '' })
    }
  })
}

const generateRandomNumbers = (min, max, count) => {
  const nums = new Set()
  while (nums.size < count) nums.add(Math.floor(Math.random() * (max - min + 1)) + min)
  return Array.from(nums)
}

const reseedRandomContent = () => {
  const allItems = document.querySelectorAll('#content li.item')
  const indices = generateRandomNumbers(0, allItems.length - 1, 10)
  const list = document.querySelector('#random-content ul.items')
  list.innerHTML = ''
  indices.forEach((i) => {
    const clone = allItems[i].cloneNode(true)
    clone.style.display = ''
    list.appendChild(clone)
  })
}

const addRandomizeListeners = () => {
  document.getElementById('randomize-toggle').addEventListener('change', (e) => {
    if (e.target.checked) {
      reseedRandomContent()
      document.getElementById('random-content').style.display = ''
      document.getElementById('content').style.display = 'none'
    } else {
      document.getElementById('random-content').style.display = 'none'
      document.getElementById('content').style.display = ''
    }
  })
  document.getElementById('randomize-reseed').addEventListener('click', () => reseedRandomContent())
}

const fetchData = () => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', import.meta.env.BASE_URL + 'data/combined.json')
  xhr.responseType = 'json'
  xhr.addEventListener('progress', (evt) => {
    if (evt.lengthComputable || evt.loaded) {
      const total = evt.total || 13000000
      const pct = Math.min(99, (evt.loaded / total) * 100)
      const bar = document.getElementById('progressBar')
      bar.style.width = pct + '%'
      bar.setAttribute('aria-valuenow', pct)
      bar.textContent = pct.toFixed(2) + '%'
    }
  })
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response)
    else reject(new Error(`HTTP ${xhr.status}`))
  }
  xhr.onerror = () => reject(new Error('Network error'))
  xhr.send()
})

const init = async () => {
  const raw = await fetchData()
  document.querySelector('.progress').remove()
  const data = groupData(raw)
  renderData(data)
  document.getElementById('content').style.display = ''
  setupFilters()
  addRandomizeListeners()
}

init()
