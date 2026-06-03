import { MonoString, HybridString } from './stringDatabase';
import monoCSV from '../data/MonoCordage.csv?raw';
import hybridCSV from '../data/HybrideCordage.csv?raw';

class CSVParser {
  private monoStrings: MonoString[] = [];
  private hybridStrings: HybridString[] = [];

  constructor() {
    this.loadMonoStrings();
    this.loadHybridStrings();
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ';' && !insideQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  private loadMonoStrings() {
    const lines = monoCSV.split('\n').filter(line => line.trim());

    for (let i = 1; i < lines.length; i++) {
      const parts = this.parseCSVLine(lines[i]);

      if (parts.length >= 10) {
        const [brand, name, type, power, control, spin, comfort, durability, tension, price, playerProfile] = parts;

        const tensionRange = tension.split('–').map(t => parseFloat(t.trim()));

        this.monoStrings.push({
          id: `mono-${i}`,
          brand: brand.trim(),
          name: name.trim(),
          type: type.trim(),
          power: parseInt(power) || 5,
          control: parseInt(control) || 5,
          spin: parseInt(spin) || 5,
          comfort: parseInt(comfort) || 5,
          durability: parseInt(durability) || 5,
          tension_min: tensionRange[0] || 22,
          tension_max: tensionRange[1] || 26,
          price: parseFloat(price) || 20,
          player_profile: playerProfile?.trim() || ''
        });
      }
    }
  }

  private loadHybridStrings() {
    const lines = hybridCSV.split('\n').filter(line => line.trim());

    for (let i = 1; i < lines.length; i++) {
      const parts = this.parseCSVLine(lines[i]);

      if (parts.length >= 9) {
        const [setup, setupType, tension, power, control, spin, comfort, durability, price, playerProfile] = parts;

        const [mainString, crossString] = setup.split('/').map(s => s.trim());
        const [tensionMain, tensionCross] = tension.split('/').map(t => parseFloat(t.trim()));

        this.hybridStrings.push({
          id: `hybrid-${i}`,
          main_string: mainString || '',
          cross_string: crossString || '',
          setup_type: setupType?.trim() || '',
          tension_main: tensionMain || 22,
          tension_cross: tensionCross || 24,
          power: parseInt(power) || 5,
          control: parseInt(control) || 5,
          spin: parseInt(spin) || 5,
          comfort: parseInt(comfort) || 5,
          durability: parseInt(durability) || 5,
          price: parseFloat(price.replace('≈', '').replace('€', '')) || 30,
          player_profile: playerProfile?.trim() || ''
        });
      }
    }
  }

  getMonoStrings(): MonoString[] {
    return this.monoStrings;
  }

  getHybridStrings(): HybridString[] {
    return this.hybridStrings;
  }

  findMonoStringsByPriority(priority: string, budget: number): MonoString[] {
    let filtered = this.monoStrings.filter(s => s.price <= budget);

    switch (priority) {
      case 'Confort':
        filtered = filtered.filter(s => s.comfort >= 7).sort((a, b) => b.comfort - a.comfort);
        break;
      case 'Contrôle':
        filtered = filtered.filter(s => s.control >= 7).sort((a, b) => b.control - a.control);
        break;
      case 'Puissance':
        filtered = filtered.filter(s => s.power >= 7).sort((a, b) => b.power - a.power);
        break;
      case 'Spin':
        filtered = filtered.filter(s => s.spin >= 7).sort((a, b) => b.spin - a.spin);
        break;
    }

    return filtered.slice(0, 10);
  }

  findHybridStringsByPriority(priority: string, budget: number): HybridString[] {
    let filtered = this.hybridStrings.filter(s => s.price <= budget);

    switch (priority) {
      case 'Confort':
        filtered = filtered.filter(s => s.comfort >= 7).sort((a, b) => b.comfort - a.comfort);
        break;
      case 'Contrôle':
        filtered = filtered.filter(s => s.control >= 7).sort((a, b) => b.control - a.control);
        break;
      case 'Puissance':
        filtered = filtered.filter(s => s.power >= 7).sort((a, b) => b.power - a.power);
        break;
      case 'Spin':
        filtered = filtered.filter(s => s.spin >= 7).sort((a, b) => b.spin - a.spin);
        break;
    }

    return filtered.slice(0, 10);
  }

  getStringById(id: string, type: 'mono' | 'hybrid'): MonoString | HybridString | null {
    if (type === 'mono') {
      return this.monoStrings.find(s => s.id === id) || null;
    } else {
      return this.hybridStrings.find(s => s.id === id) || null;
    }
  }

  searchMonoStrings(searchTerm: string): MonoString[] {
    const term = searchTerm.toLowerCase();
    return this.monoStrings
      .filter(s =>
        s.brand.toLowerCase().includes(term) ||
        s.name.toLowerCase().includes(term) ||
        s.type.toLowerCase().includes(term)
      )
      .slice(0, 20);
  }

  getMonoStringsByType(type: string): MonoString[] {
    return this.monoStrings
      .filter(s => s.type.toLowerCase().includes(type.toLowerCase()))
      .sort((a, b) => a.price - b.price);
  }

  getMonoStringsByBudgetRange(minPrice: number, maxPrice: number): MonoString[] {
    return this.monoStrings
      .filter(s => s.price >= minPrice && s.price <= maxPrice)
      .sort((a, b) => a.price - b.price);
  }

  getUniqueBrands(): string[] {
    const brands = new Set(this.monoStrings.map(s => s.brand));
    return Array.from(brands).sort();
  }

  getStringNamesByBrand(brand: string): string[] {
    return this.monoStrings
      .filter(s => s.brand === brand)
      .map(s => s.name)
      .sort();
  }

  getAllStringNames(): Array<{brand: string, name: string}> {
    return this.monoStrings
      .map(s => ({ brand: s.brand, name: s.name }))
      .sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));
  }
}

export default new CSVParser();
