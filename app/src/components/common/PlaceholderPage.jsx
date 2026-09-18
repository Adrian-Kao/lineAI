import { Link } from 'react-router'
import { ROUTES } from '../../config/routes.js'

export default function PlaceholderPage({ title }) {
  return <main className="placeholder-page"><h1>{title}</h1><Link className="return-map" to={ROUTES.map}>返回地圖</Link></main>
}
