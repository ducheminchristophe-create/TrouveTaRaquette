import csvParser from './csvParser';

export interface MonoString {
  id: string;
  brand: string;
  name: string;
  type: string;
  power: number;
  control: number;
  spin: number;
  comfort: number;
  durability: number;
  tension_min: number;
  tension_max: number;
  price: number;
  player_profile: string;
}

export interface HybridString {
  id: string;
  main_string: string;
  cross_string: string;
  setup_type: string;
  tension_main: number;
  tension_cross: number;
  power: number;
  control: number;
  spin: number;
  comfort: number;
  durability: number;
  price: number;
  player_profile: string;
}

class StringDatabase {
  async getMonoStrings(): Promise<MonoString[]> {
    return Promise.resolve(csvParser.getMonoStrings());
  }

  async getHybridStrings(): Promise<HybridString[]> {
    return Promise.resolve(csvParser.getHybridStrings());
  }

  async findMonoStringsByPriority(priority: string, budget: number): Promise<MonoString[]> {
    return Promise.resolve(csvParser.findMonoStringsByPriority(priority, budget));
  }

  async findHybridStringsByPriority(priority: string, budget: number): Promise<HybridString[]> {
    return Promise.resolve(csvParser.findHybridStringsByPriority(priority, budget));
  }

  async getStringById(id: string, type: 'mono' | 'hybrid'): Promise<MonoString | HybridString | null> {
    return Promise.resolve(csvParser.getStringById(id, type));
  }

  async searchMonoStrings(searchTerm: string): Promise<MonoString[]> {
    return Promise.resolve(csvParser.searchMonoStrings(searchTerm));
  }

  async getMonoStringsByType(type: string): Promise<MonoString[]> {
    return Promise.resolve(csvParser.getMonoStringsByType(type));
  }

  async getMonoStringsByBudgetRange(minPrice: number, maxPrice: number): Promise<MonoString[]> {
    return Promise.resolve(csvParser.getMonoStringsByBudgetRange(minPrice, maxPrice));
  }

  async getUniqueBrands(): Promise<string[]> {
    return Promise.resolve(csvParser.getUniqueBrands());
  }

  async getStringNamesByBrand(brand: string): Promise<string[]> {
    return Promise.resolve(csvParser.getStringNamesByBrand(brand));
  }

  async getAllStringNames(): Promise<Array<{brand: string, name: string}>> {
    return Promise.resolve(csvParser.getAllStringNames());
  }
}

export default new StringDatabase();
