/**
 * The collection registry — ONE description of the content model, used twice.
 *
 * The admin renders its list views and its edit forms from this file, and the
 * site reads the same table and column names from it. There are thirteen
 * collections; hand-writing thirteen list screens and thirteen forms would be
 * roughly two thousand lines that drift apart the first time a column is added.
 *
 * ADDING A FIELD IS A ONE-LINE CHANGE HERE plus a migration. The admin picks
 * it up with no new code.
 *
 * The `help` text is not decoration. Several of these fields exist to stop a
 * specific documented failure — an advisory with no expiry sitting live after
 * the typhoon, a photograph published without recorded consent, a hotline
 * nobody has dialled — and the person filling the form is the one who needs to
 * know that, at the moment they are filling it.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'markdown'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'select'
  | 'image'

export interface Field {
  readonly name: string
  readonly label: string
  readonly type: FieldType
  readonly required?: boolean
  readonly options?: readonly { value: string; label: string }[]
  readonly help?: string
  /** Shown in the list view as a column. */
  readonly inList?: boolean
}

export interface Collection {
  readonly table: string
  readonly label: string
  readonly labelSingular: string
  /** Lucide-ish name from our own icon set. */
  readonly icon: string
  /** Column the list sorts by, and the direction. */
  readonly orderBy: string
  readonly ascending: boolean
  /** Single-row collections (settings) edit in place instead of listing. */
  readonly singleton?: boolean
  readonly fields: readonly Field[]
  /** One line under the heading in the admin. */
  readonly note?: string
}

const PUBLISHED: Field = {
  name: 'is_published',
  label: 'Nakalathala (published)',
  type: 'boolean',
  inList: true,
  help: 'Alisin ang tsek para itago sa publiko nang hindi binubura.',
}

const SORT: Field = { name: 'sort_order', label: 'Pagkakasunod', type: 'number' }

export const COLLECTIONS: readonly Collection[] = [
  {
    table: 'announcements',
    label: 'Balita at Anunsyo',
    labelSingular: 'Balita',
    icon: 'megaphone',
    orderBy: 'published_at',
    ascending: false,
    note: 'Lumalabas sa homepage, sa News menu, at sa pahinang Balita.',
    fields: [
      { name: 'title_fil', label: 'Pamagat (Filipino)', type: 'text', required: true, inList: true },
      { name: 'title_en', label: 'Pamagat (English)', type: 'text', required: true },
      {
        name: 'slug',
        label: 'Slug (URL)',
        type: 'text',
        required: true,
        help: 'Maliit na titik at gitling lamang, hal. medical-mission-2026.',
      },
      {
        name: 'category',
        label: 'Kategorya',
        type: 'select',
        required: true,
        inList: true,
        options: [
          { value: 'anunsyo', label: 'Anunsyo' },
          { value: 'kalusugan', label: 'Kalusugan' },
          { value: 'ayuda', label: 'Ayuda' },
          { value: 'babala', label: 'Babala' },
          { value: 'ordinansa', label: 'Ordinansa' },
          { value: 'kaganapan', label: 'Kaganapan' },
        ],
      },
      { name: 'excerpt_fil', label: 'Buod (Filipino)', type: 'textarea' },
      { name: 'excerpt_en', label: 'Buod (English)', type: 'textarea' },
      { name: 'body_fil', label: 'Nilalaman (Filipino)', type: 'markdown' },
      { name: 'body_en', label: 'Nilalaman (English)', type: 'markdown' },
      { name: 'image_url', label: 'Larawan', type: 'image' },
      { name: 'published_at', label: 'Petsa ng paglathala', type: 'datetime', required: true, inList: true },
      {
        name: 'is_featured',
        label: 'Itampok',
        type: 'boolean',
        help: 'Ang tampok na balita ang malaking card sa News menu.',
      },
      PUBLISHED,
    ],
  },
  {
    table: 'events',
    label: 'Mga Kaganapan',
    labelSingular: 'Kaganapan',
    icon: 'calendar',
    orderBy: 'starts_at',
    ascending: true,
    fields: [
      { name: 'title_fil', label: 'Pangalan (Filipino)', type: 'text', required: true, inList: true },
      { name: 'title_en', label: 'Pangalan (English)', type: 'text', required: true },
      { name: 'starts_at', label: 'Petsa', type: 'date', required: true, inList: true },
      { name: 'time_label', label: 'Oras', type: 'text', help: 'Hal. 8:00 AM – 12:00 NN' },
      { name: 'location_fil', label: 'Lugar (Filipino)', type: 'text', inList: true },
      { name: 'location_en', label: 'Lugar (English)', type: 'text' },
      PUBLISHED,
    ],
  },
  {
    table: 'advisories',
    label: 'Babala at Abiso',
    labelSingular: 'Babala',
    icon: 'warning',
    orderBy: 'issued_at',
    ascending: false,
    note: 'Ang pinakamahalagang bahagi ng site. Laging may petsa ng pagtatapos.',
    fields: [
      {
        name: 'level',
        label: 'Antas',
        type: 'select',
        required: true,
        inList: true,
        options: [
          { value: 'info', label: 'Impormasyon' },
          { value: 'advisory', label: 'Paalala' },
          { value: 'warning', label: 'Babala' },
          { value: 'emergency', label: 'Emergency' },
        ],
      },
      { name: 'title_fil', label: 'Pamagat (Filipino)', type: 'text', required: true, inList: true },
      { name: 'title_en', label: 'Pamagat (English)', type: 'text', required: true },
      { name: 'instruction_fil', label: 'Dapat gawin (Filipino)', type: 'textarea', required: true },
      { name: 'instruction_en', label: 'Dapat gawin (English)', type: 'textarea', required: true },
      { name: 'issued_at', label: 'Petsa ng paglabas', type: 'datetime', required: true },
      {
        name: 'expires_at',
        label: 'Matatapos sa',
        type: 'datetime',
        required: true,
        inList: true,
        help: 'KAILANGAN ito. Ito ang pumipigil na manatiling nakalathala ang babala sa bagyo makalipas ang bagyo.',
      },
      { name: 'hotline_override', label: 'Espesyal na hotline', type: 'text' },
      PUBLISHED,
    ],
  },
  {
    table: 'hotlines',
    label: 'Mga Emergency Number',
    labelSingular: 'Hotline',
    icon: 'phone',
    orderBy: 'sort_order',
    ascending: true,
    note: 'Ang pinaka-delikadong datos sa site. Huwag maglagay ng numerong hindi pa natatawagan.',
    fields: [
      { name: 'label_fil', label: 'Pangalan (Filipino)', type: 'text', required: true, inList: true },
      { name: 'label_en', label: 'Pangalan (English)', type: 'text', required: true },
      {
        name: 'number',
        label: 'Numero',
        type: 'text',
        inList: true,
        help: 'Iwanang blangko kung hindi pa kumpirmado. Mas mabuti ang blangko kaysa sa maling numero.',
      },
      {
        name: 'category',
        label: 'Uri',
        type: 'select',
        required: true,
        options: [
          { value: 'barangay', label: 'Barangay' },
          { value: 'disaster', label: 'Sakuna / BDRRMC' },
          { value: 'health', label: 'Kalusugan' },
          { value: 'maritime', label: 'Dagat / Coast Guard' },
          { value: 'police', label: 'Pulisya' },
        ],
      },
      {
        name: 'verified_at',
        label: 'Huling na-verify',
        type: 'date',
        inList: true,
        help: 'Kailan ito huling tinawagan at sumagot. Walang petsa = ipinapakita bilang hindi pa kumpirmado.',
      },
      { name: 'verified_by', label: 'Sino ang nag-verify', type: 'text' },
      { name: 'active', label: 'Gamit pa', type: 'boolean', inList: true },
      SORT,
    ],
  },
  {
    table: 'officials',
    label: 'Mga Opisyal',
    labelSingular: 'Opisyal',
    icon: 'shield',
    orderBy: 'sort_order',
    ascending: true,
    fields: [
      { name: 'name', label: 'Pangalan', type: 'text', required: true, inList: true },
      { name: 'position_fil', label: 'Posisyon (Filipino)', type: 'text', required: true, inList: true },
      { name: 'position_en', label: 'Posisyon (English)', type: 'text', required: true },
      { name: 'committee', label: 'Komite', type: 'text' },
      { name: 'term', label: 'Termino', type: 'text' },
      {
        name: 'photo_consent',
        label: 'May pahintulot sa larawan',
        type: 'boolean',
        help: 'Kailangan bago maglagay ng larawan. Ang pahintulot para sa Facebook ay HINDI pahintulot para sa permanenteng website.',
      },
      {
        name: 'photo_url',
        label: 'Larawan',
        type: 'image',
        help: 'Hindi ito matatanggap ng database kung walang pahintulot sa itaas.',
      },
      PUBLISHED,
      SORT,
    ],
  },
  {
    table: 'projects',
    label: 'Mga Proyekto',
    labelSingular: 'Proyekto',
    icon: 'evacuation',
    orderBy: 'sort_order',
    ascending: true,
    fields: [
      { name: 'title_fil', label: 'Pamagat (Filipino)', type: 'text', required: true, inList: true },
      { name: 'title_en', label: 'Pamagat (English)', type: 'text', required: true },
      { name: 'status', label: 'Kalagayan', type: 'text', inList: true, help: 'Hal. Tapos na, Ginagawa, Nakabinbin' },
      { name: 'percent', label: 'Porsyento', type: 'number', inList: true },
      { name: 'budget', label: 'Badyet', type: 'text', inList: true },
      { name: 'fund_source', label: 'Pinagkunan ng pondo', type: 'text' },
      PUBLISHED,
      SORT,
    ],
  },
  {
    table: 'gallery',
    label: 'Mga Larawan',
    labelSingular: 'Larawan',
    icon: 'copy',
    orderBy: 'sort_order',
    ascending: true,
    fields: [
      { name: 'image_url', label: 'Larawan', type: 'image', required: true },
      { name: 'caption_fil', label: 'Kapsyon (Filipino)', type: 'text', required: true, inList: true },
      { name: 'caption_en', label: 'Kapsyon (English)', type: 'text', required: true },
      {
        name: 'alt_fil',
        label: 'Paglalarawan para sa hindi nakakakita (Filipino)',
        type: 'textarea',
        help: 'Ilarawan ang NAKIKITA, hindi ang pakiramdam. Ito ang naririnig ng bulag na bisita.',
      },
      { name: 'alt_en', label: 'Paglalarawan (English)', type: 'textarea' },
      {
        name: 'has_consent',
        label: 'May pahintulot ang mga nasa larawan',
        type: 'boolean',
        help: 'Kailangan kung may makikilalang tao sa larawan.',
      },
      PUBLISHED,
      SORT,
    ],
  },
  {
    table: 'attractions',
    label: 'Turismo',
    labelSingular: 'Pasyalan',
    icon: 'mangrove',
    orderBy: 'sort_order',
    ascending: true,
    fields: [
      { name: 'name_fil', label: 'Pangalan (Filipino)', type: 'text', required: true, inList: true },
      { name: 'name_en', label: 'Pangalan (English)', type: 'text', required: true },
      { name: 'description_fil', label: 'Paglalarawan (Filipino)', type: 'textarea' },
      { name: 'description_en', label: 'Paglalarawan (English)', type: 'textarea' },
      { name: 'image_url', label: 'Larawan', type: 'image' },
      { name: 'getting_there_fil', label: 'Paano pumunta (Filipino)', type: 'textarea' },
      { name: 'getting_there_en', label: 'Paano pumunta (English)', type: 'textarea' },
      PUBLISHED,
      SORT,
    ],
  },
  {
    table: 'businesses',
    label: 'Mga Negosyo',
    labelSingular: 'Negosyo',
    icon: 'rice-sack',
    orderBy: 'sort_order',
    ascending: true,
    fields: [
      { name: 'name', label: 'Pangalan', type: 'text', required: true, inList: true },
      { name: 'kind_fil', label: 'Uri (Filipino)', type: 'text', required: true, inList: true },
      { name: 'kind_en', label: 'Uri (English)', type: 'text', required: true },
      { name: 'contact', label: 'Contact', type: 'text' },
      { name: 'note_fil', label: 'Paalala (Filipino)', type: 'text' },
      { name: 'note_en', label: 'Paalala (English)', type: 'text' },
      PUBLISHED,
      SORT,
    ],
  },
  {
    table: 'faqs',
    label: 'Madalas Itanong',
    labelSingular: 'Tanong',
    icon: 'info',
    orderBy: 'sort_order',
    ascending: true,
    fields: [
      { name: 'question_fil', label: 'Tanong (Filipino)', type: 'text', required: true, inList: true },
      { name: 'question_en', label: 'Tanong (English)', type: 'text', required: true },
      { name: 'answer_fil', label: 'Sagot (Filipino)', type: 'textarea', required: true },
      { name: 'answer_en', label: 'Sagot (English)', type: 'textarea', required: true },
      PUBLISHED,
      SORT,
    ],
  },
  {
    table: 'forms',
    label: 'Mga Porma',
    labelSingular: 'Porma',
    icon: 'download',
    orderBy: 'sort_order',
    ascending: true,
    fields: [
      { name: 'title_fil', label: 'Pamagat (Filipino)', type: 'text', required: true, inList: true },
      { name: 'title_en', label: 'Pamagat (English)', type: 'text', required: true },
      { name: 'description_fil', label: 'Paglalarawan (Filipino)', type: 'textarea' },
      { name: 'description_en', label: 'Paglalarawan (English)', type: 'textarea' },
      { name: 'file_url', label: 'File (PDF)', type: 'text' },
      PUBLISHED,
      SORT,
    ],
  },
  {
    table: 'pages',
    label: 'Mga Pahina',
    labelSingular: 'Pahina',
    icon: 'document',
    orderBy: 'key',
    ascending: true,
    note: 'Ang mahabang teksto: Tungkol, Kasaysayan, Bisyon, Transparency.',
    fields: [
      {
        name: 'key',
        label: 'Susi',
        type: 'text',
        required: true,
        inList: true,
        help: 'about, history, vision, transparency — huwag baguhin kung hindi kailangan.',
      },
      { name: 'title_fil', label: 'Pamagat (Filipino)', type: 'text', required: true, inList: true },
      { name: 'title_en', label: 'Pamagat (English)', type: 'text', required: true },
      { name: 'body_fil', label: 'Nilalaman (Filipino)', type: 'markdown' },
      { name: 'body_en', label: 'Nilalaman (English)', type: 'markdown' },
      PUBLISHED,
    ],
  },
  {
    table: 'site_settings',
    label: 'Mga Setting',
    labelSingular: 'Setting',
    icon: 'checklist',
    orderBy: 'id',
    ascending: true,
    singleton: true,
    note: 'Ang lagay ng dagat at ang biyahe ng bangka ay nagbabago araw-araw. Dito iyon binabago.',
    fields: [
      {
        name: 'sea_state',
        label: 'Lagay ng dagat',
        type: 'select',
        required: true,
        options: [
          { value: 'calm', label: 'Mahinay' },
          { value: 'moderate', label: 'Katamtaman' },
          { value: 'rough', label: 'Malakas' },
          { value: 'dangerous', label: 'Delikado' },
        ],
      },
      { name: 'wave_height_m', label: 'Taas ng alon (m)', type: 'number' },
      { name: 'wind_kph', label: 'Bilis ng hangin (km/h)', type: 'number' },
      { name: 'sea_observed_at', label: 'Oras ng pagbasa', type: 'datetime' },
      { name: 'sea_source', label: 'Pinagkunan', type: 'text' },
      {
        name: 'boat_status',
        label: 'Biyahe ng bangka',
        type: 'select',
        required: true,
        options: [
          { value: 'running', label: 'May biyahe' },
          { value: 'uncertain', label: 'Hindi sigurado' },
          { value: 'cancelled', label: 'Kanselado' },
        ],
      },
      { name: 'boat_note_fil', label: 'Paalala sa biyahe (Filipino)', type: 'text' },
      { name: 'boat_note_en', label: 'Paalala sa biyahe (English)', type: 'text' },
      { name: 'address_fil', label: 'Address (Filipino)', type: 'text' },
      { name: 'address_en', label: 'Address (English)', type: 'text' },
      { name: 'phone', label: 'Telepono', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'office_hours_fil', label: 'Oras ng opisina (Filipino)', type: 'text' },
      { name: 'office_hours_en', label: 'Oras ng opisina (English)', type: 'text' },
      { name: 'facebook_url', label: 'Facebook', type: 'text' },
      { name: 'messenger_url', label: 'Messenger', type: 'text' },
      { name: 'instagram_url', label: 'Instagram', type: 'text' },
      { name: 'youtube_url', label: 'YouTube', type: 'text' },
    ],
  },
]

export const collectionByTable = (table: string) =>
  COLLECTIONS.find((c) => c.table === table)
