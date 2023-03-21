export interface ICountryCountry {
   id?: string
   title: string
   code: string
   population: number
   created_at: Date
   updated_at: Date
}

export interface ICountryRegion {
   id?: string
   title: string
   code: string
   population: number
   country_id: number
   created_at: Date
   updated_at: Date
}

export interface ICountryTag {
   id?: string
   title: string
}

export interface ICountryCity {
   id?: string
   title: string
   code: string
   population: number
   country_id: number
   region_id: number
   created_at: Date
   updated_at: Date
   tags: number
   img: string
   attributes: string
}

export interface ICountryAttributeType {
   id?: string
   title: string
}

export interface ICountryAttribute {
   id?: string
   title: string
   attribute_type: string
}

export interface ICountryTest {
   id?: string
   value: string
}

export interface ICountryImgSettings {
   id?: string
   schema_name: string
   table_name: string
   files_dir: string
   img_size: number
   quality: number
   ext: string
}

export interface ICountryCategory {
   id?: string
   title: string
   parent_id: number
}

