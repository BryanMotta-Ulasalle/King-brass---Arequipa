import React, { useRef, useState } from 'react'
import { branches, buildWhatsAppLink, categories, menu } from './menu'
import { photoDimensions } from './photo-dimensions'

const media = (name, extension = 'webp') => '/media/' + name + '.' + extension
const fullMenu = [...menu.filter((product) => product.featured), ...menu.filter((product) => !product.featured)]
const whatsappBranch = branches.find((branch) => branch.whatsapp)
const heroSizes = '(max-width: 690px) 65vw, 560px'
const menuSizes = '(max-width: 350px) calc(100vw - 32px), (max-width: 690px) 47vw, (max-width: 1312px) 32vw, 406px'

function Icon({ name, size = 20 }) {
  const paths = {
    arrow: <><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></>,
    down: <><path d="M12 4v15"/><path d="m6 13 6 6 6-6"/></>,
    external: <><path d="M6 18 18 6"/><path d="M8 6h10v10"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    minus: <path d="M5 12h14"/>,
    close: <><path d="m6 6 12 12"/><path d="M18 6 6 18"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11s-8-6-8-11a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    phone: <path d="M8 3H5a2 2 0 0 0-2 2c0 8.8 7.2 16 16 16a2 2 0 0 0 2-2v-3l-5-2-2 2a12 12 0 0 1-6-6l2-2Z"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    bag: <><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
    whatsapp: <><path d="M20.5 11.8a8.5 8.5 0 0 1-12.7 7.4L4 20l.9-3.7a8.5 8.5 0 1 1 15.6-4.5Z"/><path d="M9 8.1c-.6.1-1 .5-1 1.1 0 2.5 2.7 5.3 5.2 6 .8.2 1.7-.1 2-.9l.2-.6-2.2-1.1-.7.8c-1.1-.5-1.9-1.3-2.4-2.4l.6-.6-.9-2.3Z"/></>,
    crown: <><path d="m3 6 4.5 4.2L12 4l4.5 6.2L21 6l-2 12H5L3 6Z"/><path d="M5 15h14"/></>,
  }
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function Brand() {
  return (
    <a className="brand" href="#inicio" aria-label="King Bras, inicio">
      <img src={media('logo')} width="48" height="48" alt="" />
      <span><strong>KING BRAS<span>.</span></strong><small>POLLERÍA DE AREQUIPA</small></span>
    </a>
  )
}

function Photo({ image, illustration, alt, sizes, loading, fetchPriority }) {
  const [width, height] = illustration ? [560, 315] : photoDimensions[image]
  const src = media(image, illustration ? 'svg' : 'webp')
  const srcSet = illustration ? undefined : media(image + '-320') + ' 320w, ' + src + ' ' + width + 'w'

  return <img src={src} srcSet={srcSet} sizes={illustration ? undefined : sizes} alt={alt} width={width} height={height} loading={loading} fetchPriority={fetchPriority} />
}

function HeroPhoto({ category, label, name, image, alt, fetchPriority, onSelect }) {
  return (
    <a className={'hero-photo hero-photo--' + category} href="#carta" onClick={() => onSelect(category)}>
      <Photo image={image} alt={alt} sizes={heroSizes} fetchPriority={fetchPriority} />
      <span className="photo-caption"><span><small>{label}</small><strong>{name}</strong></span><span className="photo-arrow"><Icon name="external" /></span></span>
    </a>
  )
}

function MenuCard({ product, quantity, add }) {
  const category = categories.find(({ id }) => id === product.category)
  return (
    <article className={'menu-card' + (product.image ? '' : ' menu-card--text')}>
      {product.image && (
        <div className={'menu-photo menu-photo--' + product.category}>
          <Photo image={product.image} illustration={product.illustration} alt="" sizes={menuSizes} loading="lazy" />
          {product.illustration && <span className="menu-photo-label">Ilustración</span>}
        </div>
      )}
      <div className="menu-card-body">
        <p className="menu-category">{category.label}</p>
        <h3>{product.name}</h3>
        {product.note && <p className="menu-note">{product.note}</p>}
        <button type="button" className="add-button" onClick={add} aria-label={'Agregar ' + product.name}>
          <Icon name="plus" size={17} /> Agregar {quantity > 0 && <span className="item-quantity" aria-hidden="true">{quantity}</span>}
        </button>
      </div>
    </article>
  )
}

function OrderDialog({ dialogRef, items, selectedId, setSelectedId, changeQuantity, restoreOrderFocus }) {
  const closeButton = useRef(null)
  const branch = branches.find(({ id }) => id === selectedId)
  return (
    <dialog ref={dialogRef} className="order-dialog" aria-labelledby="order-title" onClose={restoreOrderFocus}>
      <div className="dialog-header">
        <div><p className="section-label">KING BRAS</p><h2 id="order-title">Tu pedido</h2></div>
        <form method="dialog"><button ref={closeButton} className="icon-button" aria-label="Cerrar pedido" autoFocus><Icon name="close" /></button></form>
      </div>
      {items.length ? (
        <ul className="order-items">
          {items.map(({ id, name, quantity }) => (
            <li key={id}>
              <span>{name}</span>
              <div className="quantity-control">
                <button type="button" aria-label={'Quitar una unidad de ' + name} onClick={() => { if (quantity === 1) closeButton.current.focus(); changeQuantity(id, -1) }}><Icon name="minus" size={16} /></button>
                <span aria-label={quantity + ' unidades'}>{quantity}</span>
                <button type="button" aria-label={'Agregar una unidad de ' + name} onClick={() => changeQuantity(id, 1)}><Icon name="plus" size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="order-empty">Elige tu sede para consultar o agrega platos de la carta.</p>}
      <fieldset className="branch-picker">
        <legend>¿En qué sede quieres pedir?</legend>
        {branches.map(({ id, name, address }) => (
          <label key={id}>
            <input type="radio" name="sede" checked={id === selectedId} onChange={() => setSelectedId(id)} />
            <span><strong>{name}</strong><small>{address}</small></span>
          </label>
        ))}
      </fieldset>
      {branch.whatsapp ? (
        <a className="button button--primary dialog-cta" href={buildWhatsAppLink(branch, items)} target="_blank" rel="noreferrer"><Icon name="whatsapp" /> Abrir WhatsApp <Icon name="external" size={17} /></a>
      ) : (
        <a className="button button--primary dialog-cta" href={'tel:+' + branch.phone}><Icon name="phone" /> Llamar al {branch.displayPhone}</a>
      )}
      <p className="order-help">{branch.whatsapp ? 'Revisa el mensaje y envíalo desde WhatsApp. La sede te confirma el total y el reparto.' : 'Consulta por teléfono la disponibilidad, el total y la cobertura de esta sede.'}</p>
    </dialog>
  )
}

export default function App() {
  const [category, setCategory] = useState('toda')
  const [quantities, setQuantities] = useState({})
  const [announcement, setAnnouncement] = useState('')
  const [selectedId, setSelectedId] = useState(branches[0].id)
  const dialogRef = useRef(null)
  const headerOrderButton = useRef(null)
  const orderOpener = useRef(null)
  const items = menu.filter(({ id }) => quantities[id] > 0).map((product) => ({ ...product, quantity: quantities[product.id] }))
  const count = items.reduce((total, { quantity }) => total + quantity, 0)
  const visibleProducts = category === 'toda' ? fullMenu : menu.filter((product) => product.category === category)

  function changeQuantity(id, delta) {
    setQuantities((current) => ({ ...current, [id]: Math.max(0, (current[id] ?? 0) + delta) }))
  }

  function addProduct(product) {
    changeQuantity(product.id, 1)
    setAnnouncement(product.name + ' agregado. ' + (count + 1) + ' en tu pedido.')
  }

  function openOrder(event, id) {
    orderOpener.current = event.currentTarget
    if (id) setSelectedId(id)
    dialogRef.current.showModal()
  }

  function restoreOrderFocus() {
    const opener = orderOpener.current
    const target = opener?.isConnected && opener.getClientRects().length ? opener : headerOrderButton.current
    target?.focus()
  }

  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <header className="site-header" id="inicio">
        <div className="wrap header-inner">
          <Brand />
          <nav aria-label="Navegación principal"><a href="#carta">La carta</a><a href="#sedes">Sedes</a></nav>
          <button ref={headerOrderButton} className="button button--header" type="button" onClick={openOrder}>
            <Icon name={count ? 'bag' : 'whatsapp'} size={19} /><span>{count ? 'Mi pedido' : 'Pedir'}{count > 0 && <span className="header-count"> {count}</span>}</span>
          </button>
        </div>
      </header>
      <main id="contenido">
        <section className="hero" aria-labelledby="hero-title">
          <div className="wrap hero-inner">
            <div className="hero-copy">
              <p className="hero-kicker"><span></span> AREQUIPA <b>/</b> DESDE 2008</p>
              <h1 id="hero-title">¿Brasita<br /><em>o broaster?</em></h1>
              <p className="hero-description">Pollo a la brasa, broaster crujiente y conazos. Arma tu pedido y elige tu sede.</p>
              <div className="hero-actions">
                <a className="button button--primary" href="#carta" onClick={() => setCategory('toda')}>Ver la carta <Icon name="down" size={18} /></a>
                <button className="button button--outline" type="button" onClick={(event) => openOrder(event, whatsappBranch?.id)}><Icon name={whatsappBranch ? 'whatsapp' : 'bag'} size={20} /> {whatsappBranch ? 'Pedir por WhatsApp' : 'Hacer un pedido'}</button>
              </div>
            </div>
            <div className="hero-gallery">
              <HeroPhoto category="brasa" label="01 / A LA BRASA" name="Brasita" image="portada-brasa" alt="Pollo dorado a la brasa con papas y ensalada" fetchPriority="high" onSelect={setCategory} />
              <HeroPhoto category="broaster" label="02 / BROASTER" name="Broaster" image="portada-broaster" alt="Piezas de broaster doradas con papas" onSelect={setCategory} />
              <span className="gallery-stamp" aria-hidden="true"><Icon name="crown" size={26} /></span>
            </div>
          </div>
          <div className="wrap hero-details">
            <a href="#sedes"><Icon name="pin" size={18} /> Mariano Melgar <span>·</span> Cayma</a>
            <span><Icon name="clock" size={18} /> 12:00 p. m. a 10:00 p. m.</span>
            <button type="button" onClick={openOrder}><Icon name="whatsapp" size={18} /> Pedidos a domicilio</button>
          </div>
        </section>

        <section className="menu-section" id="carta" aria-labelledby="menu-title">
          <div className="wrap">
            <div className="section-intro">
              <div><p className="section-label">01 / LA CARTA</p><h2 id="menu-title">Carta de King Bras</h2></div>
              <p>Del cuarto de pollo al pedido familiar. Elige tus platos y confirma precios y disponibilidad con la sede.</p>
            </div>
            <div className="filters" aria-label="Categorías de la carta" role="group">
              {categories.map(({ id, label }) => (
                <button key={id} type="button" aria-pressed={category === id} onClick={() => setCategory(id)}>{label}</button>
              ))}
            </div>
            <div className="menu-grid">
              {visibleProducts.map((product) => <MenuCard key={product.id} product={product} quantity={quantities[product.id] ?? 0} add={() => addProduct(product)} />)}
            </div>
            <div className="menu-bottom">
              <p>Fotos referenciales. La carta puede variar según la sede.</p>
              {count > 0 && <button className="button button--dark" type="button" onClick={openOrder}><Icon name="bag" size={19} /> Ver mi pedido · {count}</button>}
            </div>
          </div>
        </section>

        <section className="locations" id="sedes" aria-labelledby="locations-title">
          <div className="wrap">
            <div className="section-intro">
              <div><p className="section-label">02 / ENCUÉNTRANOS</p><h2 id="locations-title">Elige tu sede.</h2></div>
              <p>Visítanos en Arequipa o consulta la cobertura de delivery con tu sede.</p>
            </div>
            <div className="location-grid">
              {branches.map((branch, index) => (
                <article className="location" id={branch.id} key={branch.id}>
                  <div className="location-top"><Icon name="pin" size={22} /><span>SEDE 0{index + 1}</span></div>
                  <h3>{branch.name}</h3>
                  <p>{branch.address}, Arequipa · <a className="location-phone" href={'tel:+' + branch.phone} aria-label={'Llamar a ' + branch.name + ' al ' + branch.displayPhone}>{branch.displayPhone}</a></p>
                  <div className="location-actions">
                    <button className="button button--dark" type="button" onClick={(event) => openOrder(event, branch.id)}><Icon name={branch.whatsapp ? 'whatsapp' : 'phone'} size={18} /> {branch.whatsapp ? 'Pedir por WhatsApp' : 'Consultar pedido'}</button>
                    <a className="directions-link" aria-label={'Cómo llegar a King Bras de ' + branch.name} href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(branch.maps)} target="_blank" rel="noreferrer">Cómo llegar <Icon name="external" size={16} /></a>
                  </div>
                </article>
              ))}
            </div>
            <p className="published-hours"><Icon name="clock" size={17} /> Horario publicado · 12:00 p. m. a 10:00 p. m.</p>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="wrap footer-inner">
          <Brand />
          <div className="footer-links">
            <a href="https://www.tiktok.com/@kingbras_aqp" target="_blank" rel="noreferrer">King Bras en TikTok <Icon name="external" size={15} /></a>
            <a href="https://www.rappi.com.pe/restaurantes/113169-king-bras" target="_blank" rel="noreferrer">Carta en Rappi <Icon name="external" size={15} /></a>
            <a href="https://www.google.com/maps/search/?api=1&amp;query=King+Bras+Polleria+Am%C3%A9rica+512+Mariano+Melgar" target="_blank" rel="noreferrer">Fotos en Maps <Icon name="external" size={15} /></a>
          </div>
          <p>Arequipa, Perú</p>
        </div>
      </footer>
      {count > 0 && (
        <button className="button button--primary mobile-order" type="button" onClick={openOrder}>
          <Icon name="bag" size={19} /> Ver mi pedido <span>{count}</span>
        </button>
      )}
      <span className="sr-only" aria-live="polite">{announcement}</span>
      <OrderDialog dialogRef={dialogRef} items={items} selectedId={selectedId} setSelectedId={setSelectedId} changeQuantity={changeQuantity} restoreOrderFocus={restoreOrderFocus} />
    </>
  )
}
