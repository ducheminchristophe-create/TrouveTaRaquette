/**
 * csvParser.ts — migré de CSV ?raw (Vite) vers JSON (Next.js compatible).
 * Les fichiers MonoCordage.json et HybrideCordage.json sont générés depuis les CSV originaux.
 */
import { MonoString, HybridString } from './stringDatabase'
import monoData from '../data/MonoCordage.json'
import hybridData from '../data/HybrideCordage.json'

class CSVParser {
  private monoStrings: MonoString[] = monoData as MonoString[]
  private hybridStrings: HybridString[] = hybridData as HybridString[]

  getMonoStrings(): MonoString[] {
    return this.monoStrings
  }

  getHybridStrings(): HybridString[] {
    return this.hybridStrings
  }

  findMonoStringsByPriority(priority: string, budget: number): MonoString[] {
    let filtered = this.monoStrings.filter(s => s.price <= budget)
    switch (priority) {
      case 'Confort':   filtered = filtered.filter(s => s.comfort   >= 7).sort((a,b) => b.comfort   - a.comfort);   break
      case 'Contrôle':  filtered = filtered.filter(s => s.control   >= 7).sort((a,b) => b.control   - a.control);   break
      case 'Puissance': filtered = filtered.filter(s => s.power     >= 7).sort((a,b) => b.power     - a.power);     break
      case 'Spin':      filtered = filtered.filter(s => s.spin      >= 7).sort((a,b) => b.spin      - a.spin);      break
    }
    return filtered.slice(0, 10)
  }

  findHybridStringsByPriority(priority: string, budget: number): HybridString[] {
    let filtered = this.hybridStrings.filter(s => s.price <= budget)
    switch (priority) {
      case 'Confort':   filtered = filtered.filter(s => s.comfort   >= 7).sort((a,b) => b.comfort   - a.comfort);   break
      case 'Contrôle':  filtered = filtered.filter(s => s.control   >= 7).sort((a,b) => b.control   - a.control);   break
      case 'Puissance': filtered = filtered.filter(s => s.power     >= 7).sort((a,b) => b.power     - a.power);     break
      case 'Spin':      filtered = filtered.filter(s => s.spin      >= 7).sort((a,b) => b.spin      - a.spin);      break
    }
    return filtered.slice(0, 10)
  }

  getStringById(id: string, type: 'mono' | 'hybrid'): MonoString | HybridString | null {
    return type === 'mono'
      ? this.monoStrings.find(s => s.id === id) ?? null
      : this.hybridStrings.find(s => s.id === id) ?? null
  }

  searchMonoStrings(searchTerm: string): MonoString[] {
    const term = searchTerm.toLowerCase()
    return this.monoStrings
      .filter(s => s.brand.toLowerCase().includes(term) || s.name.toLowerCase().includes(term) || s.type.toLowerCase().includes(term))
      .slice(0, 20)
  }

  getMonoStringsByType(type: string): MonoString[] {
    return this.monoStrings.filter(s => s.type.toLowerCase().includes(type.toLowerCase())).sort((a,b) => a.price - b.price)
  }

  getMonoStringsByBudgetRange(min: number, max: number): MonoString[] {
    return this.monoStrings.filter(s => s.price >= min && s.price <= max).sort((a,b) => a.price - b.price)
  }

  getUniqueBrands(): string[] {
    return Array.from(new Set(this.monoStrings.map(s => s.brand))).sort()
  }

  getStringNamesByBrand(brand: string): string[] {
    return this.monoStrings.filter(s => s.brand === brand).map(s => s.name).sort()
  }

  getAllStringNames(): Array<{ brand: string; name: string }> {
    return this.monoStrings.map(s => ({ brand: s.brand, name: s.name })).sort((a,b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name))
  }
}

export default new CSVParser()
