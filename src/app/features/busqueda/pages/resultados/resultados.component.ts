import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AlojamientoService } from "@app/core/services/alojamiento.service";
import { Alojamiento, Servicio } from "@app/core/models/alojamiento.model";

@Component({
  selector: "app-resultados",
  templateUrl: "./resultados.component.html",
  styleUrls: ["./resultados.component.scss"],
})
export class ResultadosComponent implements OnInit {
  showFilters = false;
  alojamientos: Alojamiento[] = [];
  filteredProperties: Alojamiento[] = [];

  selectedSort = "recomendados";
  minPrice = 0;
  maxPrice = 10000;
  priceRange: [number, number] = [0, 10000];
  selectedAmenities: string[] = [];
  dateRange: { start: string; end: string } = { start: "", end: "" };
  maxGuests: number | null = null;
  cityQuery = "";
  citySuggestions: string[] = [];
  showCitySuggestions = false;
  showAdvancedSearch = false;
  readonly quickServices = ["Wifi", "Piscina", "Mascotas permitidas"];

  isLoading = false;
  error: string | null = null;
  totalElements = 0;
  currentPage = 0;
  pageSize = 20;

  constructor(
    private route: ActivatedRoute,
    private alojamientoService: AlojamientoService
  ) {}

  ngOnInit() {
    // Capturar el query parameter si existe
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.cityQuery = params['q'];
      }
      this.cargarAlojamientos();
    });
  }

  cargarAlojamientos() {
    this.isLoading = true;
    this.error = null;

    // Preparar los parámetros de búsqueda
    // NO enviamos ciudad al backend para obtener TODOS los alojamientos
    // y hacer filtrado flexible en el frontend
    const searchParams: any = {
      page: this.currentPage,
      size: 100 // Aumentamos para obtener más resultados y filtrar localmente
    };

    // Solo enviamos filtros que el backend puede manejar exactamente
    if (this.dateRange.start) {
      searchParams.fechaInicio = this.dateRange.start;
    }
    if (this.dateRange.end) {
      searchParams.fechaFin = this.dateRange.end;
    }
    if (this.priceRange[0] > 0) {
      searchParams.precioMin = this.priceRange[0];
    }
    if (this.priceRange[1] < 10000) {
      searchParams.precioMax = this.priceRange[1];
    }

    console.log('Buscando con parámetros:', searchParams);

    this.alojamientoService.buscar(searchParams).subscribe({
      next: (response) => {
        console.log('Respuesta del backend:', response);
        this.alojamientos = response.content;
        this.totalElements = response.totalElements;

        // Calcular rango de precios
        if (this.alojamientos.length > 0) {
          this.minPrice = Math.min(...this.alojamientos.map(a => a.precioPorNoche));
          this.maxPrice = Math.max(...this.alojamientos.map(a => a.precioPorNoche));
          if (this.priceRange[0] === 0 && this.priceRange[1] === 10000) {
            this.priceRange = [this.minPrice, this.maxPrice];
          }
        }

        // Aplicar filtros locales (incluye búsqueda flexible de ciudad)
        this.applyLocalFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar alojamientos:', err);
        this.error = 'Error al cargar los alojamientos. Por favor, intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(keepFiltersOpen = true) {
    this.currentPage = 0;
    this.cargarAlojamientos();

    if (!keepFiltersOpen) {
      this.showFilters = false;
    }
  }

  applyLocalFilters() {
    const normalizedCityQuery = this.cityQuery.trim().toLowerCase();

    console.log('=== APLICANDO FILTROS ===');
    console.log('Filtros seleccionados:', this.selectedAmenities);
    console.log('Ciudad:', normalizedCityQuery);
    console.log('Huéspedes:', this.maxGuests);

    // Aplicar filtros locales adicionales que no están en el backend
    this.filteredProperties = this.alojamientos.filter(alojamiento => {
      // Filtro flexible por ciudad
      const matchesCity = !normalizedCityQuery ||
        alojamiento.ciudad.toLowerCase().includes(normalizedCityQuery) ||
        alojamiento.direccion.toLowerCase().includes(normalizedCityQuery) ||
        alojamiento.titulo.toLowerCase().includes(normalizedCityQuery) ||
        this.fuzzyMatch(alojamiento.ciudad.toLowerCase(), normalizedCityQuery);

      // Filtro por servicios/amenidades
      let hasAmenities = true;
      if (this.selectedAmenities.length > 0) {
        hasAmenities = this.selectedAmenities.every(amenity => {
          const servicioEnum = this.mapAmenityToServicio(amenity);
          const hasService = servicioEnum ? alojamiento.servicios.includes(servicioEnum) : false;

          // Debug para cada alojamiento
          console.log(`Chequeando ${amenity} en "${alojamiento.titulo}"`);
          console.log(`  - Servicio Enum buscado:`, servicioEnum);
          console.log(`  - Servicios del alojamiento:`, alojamiento.servicios);
          console.log(`  - ¿Tiene el servicio?:`, hasService);

          if (!hasService) {
            console.log(`❌ Alojamiento "${alojamiento.titulo}" NO tiene ${amenity}`);
          } else {
            console.log(`✅ Alojamiento "${alojamiento.titulo}" SÍ tiene ${amenity}`);
          }

          return hasService;
        });
      }

      // Filtro por número de huéspedes
      const matchesGuests = !this.maxGuests || alojamiento.maxHuespedes >= this.maxGuests;

      // Filtro por estado (solo mostrar activos)
      const isActive = alojamiento.estado === 'ACTIVO';

      const passes = matchesCity && hasAmenities && matchesGuests && isActive;

      return passes;
    });

    this.sortProperties();
    console.log('Ciudad buscada:', normalizedCityQuery);
    console.log('Total alojamientos del backend:', this.alojamientos.length);
    console.log('Propiedades filtradas localmente:', this.filteredProperties.length);
    console.log('=== FIN FILTROS ===');
  }

  private fuzzyMatch(text: string, query: string): boolean {
    // Verifica si las letras del query aparecen en orden en el texto
    let queryIndex = 0;
    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        queryIndex++;
      }
    }
    return queryIndex === query.length;
  }

  private mapAmenityToServicio(amenity: string): Servicio | null {
    const mapping: { [key: string]: Servicio } = {
      'Wifi': Servicio.WIFI,
      'Piscina': Servicio.PISCINA,
      'Mascotas permitidas': Servicio.MASCOTAS,
      'Cocina': Servicio.COCINA,
      'Aire acondicionado': Servicio.AIRE_ACONDICIONADO,
      'Estacionamiento': Servicio.ESTACIONAMIENTO,
      'TV': Servicio.TV,
      'Lavadora': Servicio.LAVADORA
    };
    return mapping[amenity] || null;
  }

  toggleFavorite(alojamiento: Alojamiento, event: Event) {
    event.stopPropagation();
    alojamiento.esFavorito = !alojamiento.esFavorito;
  }

  sortProperties() {
    switch (this.selectedSort) {
      case "precio-asc":
        this.filteredProperties.sort((a, b) => a.precioPorNoche - b.precioPorNoche);
        break;
      case "precio-desc":
        this.filteredProperties.sort((a, b) => b.precioPorNoche - a.precioPorNoche);
        break;
      case "mejor-valorados":
        this.filteredProperties.sort((a, b) => (b.calificacionPromedio || 0) - (a.calificacionPromedio || 0));
        break;
      default:
        break;
    }
  }

  getUniqueAmenities(): string[] {
    const amenitiesSet = new Set<string>();
    for (const alojamiento of this.alojamientos) {
      for (const servicio of alojamiento.servicios) {
        amenitiesSet.add(this.formatServicio(servicio));
      }
    }
    return Array.from(amenitiesSet);
  }

  getUniqueCities(): string[] {
    const cities = new Set<string>();
    for (const alojamiento of this.alojamientos) {
      if (alojamiento.ciudad) {
        cities.add(alojamiento.ciudad);
      }
    }
    return Array.from(cities).sort();
  }

  getCityList(): string[] {
    const cities = new Set<string>();
    for (const alojamiento of this.alojamientos) {
      cities.add(alojamiento.ciudad);
    }
    return Array.from(cities);
  }

  formatServicio(servicio: Servicio): string {
    const mapping: { [key in Servicio]: string } = {
      [Servicio.WIFI]: 'Wifi',
      [Servicio.PISCINA]: 'Piscina',
      [Servicio.MASCOTAS]: 'Mascotas permitidas',
      [Servicio.COCINA]: 'Cocina',
      [Servicio.AIRE_ACONDICIONADO]: 'Aire acondicionado',
      [Servicio.ESTACIONAMIENTO]: 'Estacionamiento',
      [Servicio.TV]: 'TV',
      [Servicio.LAVADORA]: 'Lavadora'
    };
    return mapping[servicio] || servicio;
  }

  onCityInput(value: string) {
    this.cityQuery = value;
    this.showCitySuggestions = true;
    this.updateCitySuggestions(value);
  }

  updateCitySuggestions(value: string) {
    const normalized = value.trim().toLowerCase();
    const availableCities = this.getCityList();

    if (!normalized) {
      this.citySuggestions = availableCities.slice(0, 6);
      return;
    }

    this.citySuggestions = availableCities
      .filter(city => city.toLowerCase().includes(normalized))
      .slice(0, 6);

    if (this.citySuggestions.length === 0) {
      this.citySuggestions = availableCities.slice(0, 6);
    }
  }

  selectCity(city: string) {
    this.cityQuery = city;
    this.showCitySuggestions = false;
    this.applyFilters();
  }

  clearCity() {
    this.cityQuery = "";
    this.updateCitySuggestions("");
    this.applyFilters();
  }

  hideCitySuggestions() {
    setTimeout(() => {
      this.showCitySuggestions = false;
    }, 150);
  }

  onDateChange(field: "start" | "end", value: string) {
    this.dateRange = { ...this.dateRange, [field]: value };
    if (this.dateRange.start && this.dateRange.end) {
      this.applyFilters();
    }
  }

  onPriceInput(index: number, value: string | number) {
    const numericValue = Number(value);
    const updatedRange: [number, number] = [...this.priceRange] as [number, number];
    updatedRange[index] = numericValue;

    if (updatedRange[0] > updatedRange[1]) {
      if (index === 0) {
        updatedRange[0] = updatedRange[1];
      } else {
        updatedRange[1] = updatedRange[0];
      }
    }

    this.priceRange = [
      Math.max(this.minPrice, Math.min(updatedRange[0], this.maxPrice)),
      Math.max(this.minPrice, Math.min(updatedRange[1], this.maxPrice)),
    ];
  }

  toggleAmenity(amenity: string) {
    const index = this.selectedAmenities.indexOf(amenity);
    if (index === -1) {
      this.selectedAmenities.push(amenity);
    } else {
      this.selectedAmenities.splice(index, 1);
    }
    this.applyLocalFilters();
  }

  onGuestsChange(guests: number) {
    this.maxGuests = guests > 0 ? guests : null;
    this.applyLocalFilters();
  }

  toggleAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }
}
