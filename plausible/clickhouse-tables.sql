CREATE TABLE IF NOT EXISTS plausible.sessions_v2
(
    session_id UInt64,
    sign Int8,
    site_id UInt64,
    user_id UInt64,
    hostname String CODEC(ZSTD(3)),
    timestamp DateTime CODEC(Delta(4), LZ4),
    start DateTime CODEC(Delta(4), LZ4),
    is_bounce UInt8,
    entry_page String CODEC(ZSTD(3)),
    exit_page String CODEC(ZSTD(3)),
    pageviews Int32,
    events Int32,
    duration UInt32,
    referrer String CODEC(ZSTD(3)),
    referrer_source String CODEC(ZSTD(3)),
    country_code LowCardinality(FixedString(2)),
    screen_size LowCardinality(String),
    operating_system LowCardinality(String),
    browser LowCardinality(String),
    utm_medium String CODEC(ZSTD(3)),
    utm_source String CODEC(ZSTD(3)),
    utm_campaign String CODEC(ZSTD(3)),
    browser_version LowCardinality(String),
    operating_system_version LowCardinality(String),
    subdivision1_code LowCardinality(String),
    subdivision2_code LowCardinality(String),
    city_geoname_id UInt32,
    utm_content String CODEC(ZSTD(3)),
    utm_term String CODEC(ZSTD(3)),
    transferred_from String,
    `entry_meta.key` Array(String) CODEC(ZSTD(3)),
    `entry_meta.value` Array(String) CODEC(ZSTD(3)),
    exit_page_hostname String CODEC(ZSTD(3)),
    recovery_id UInt64,
    click_id_param LowCardinality(String),
    channel LowCardinality(String),
    
    -- ALIAS columns untuk kompatibilitas API Plausible
    source LowCardinality(String) ALIAS referrer_source,
    device LowCardinality(String) ALIAS screen_size,
    screen LowCardinality(String) ALIAS screen_size,
    os LowCardinality(String) ALIAS operating_system,
    os_version LowCardinality(String) ALIAS operating_system_version,
    country LowCardinality(FixedString(2)) ALIAS country_code,
    region LowCardinality(String) ALIAS subdivision1_code,
    city UInt32 ALIAS city_geoname_id,
    entry_page_hostname String ALIAS hostname,
    
    INDEX minmax_timestamp timestamp TYPE minmax GRANULARITY 1
)
ENGINE = VersionedCollapsingMergeTree(sign, events)
PARTITION BY toYYYYMM(start)
PRIMARY KEY (site_id, toDate(start), user_id, session_id)
ORDER BY (site_id, toDate(start), user_id, session_id)
SAMPLE BY user_id
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS plausible.ingest_counters
(
    event_timebucket DateTime,
    domain LowCardinality(String),
    site_id Nullable(UInt64),
    metric LowCardinality(String),
    value UInt64,
    tracker_script_version UInt16
)
ENGINE = SummingMergeTree(value)
ORDER BY (domain, toDate(event_timebucket), metric, toStartOfMinute(event_timebucket), tracker_script_version)
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS plausible.imported_visitors
(
    site_id UInt64,
    date Date,
    visitors UInt64,
    pageviews UInt64,
    bounces UInt64,
    visits UInt64,
    visit_duration UInt64,
    import_id UInt64
)
ENGINE = MergeTree
ORDER BY (site_id, date)
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS plausible.imported_sources
(
    site_id UInt64,
    date Date,
    source String,
    utm_medium String,
    utm_campaign String,
    utm_content String,
    utm_term String,
    visitors UInt64,
    visits UInt64,
    visit_duration UInt64,
    bounces UInt32,
    import_id UInt64,
    pageviews UInt64,
    referrer String,
    utm_source String,
    channel LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (site_id, date, source)
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS plausible.imported_pages
(
    site_id UInt64,
    date Date,
    hostname String,
    page String,
    visitors UInt64,
    pageviews UInt64,
    exits UInt64,
    import_id UInt64,
    visits UInt64,
    total_scroll_depth UInt64,
    total_scroll_depth_visits UInt64,
    total_time_on_page UInt64,
    total_time_on_page_visits UInt64
)
ENGINE = MergeTree
ORDER BY (site_id, date, hostname, page)
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS plausible.imported_operating_systems
(
    site_id UInt64,
    date Date,
    operating_system String,
    visitors UInt64,
    visits UInt64,
    visit_duration UInt64,
    bounces UInt32,
    import_id UInt64,
    pageviews UInt64,
    operating_system_version String
)
ENGINE = MergeTree
ORDER BY (site_id, date, operating_system)
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS plausible.imported_locations
(
    site_id UInt64,
    date Date,
    country String,
    region String,
    city UInt64,
    visitors UInt64,
    visits UInt64,
    visit_duration UInt64,
    bounces UInt32,
    import_id UInt64,
    pageviews UInt64
)
ENGINE = MergeTree
ORDER BY (site_id, date, country, region, city)
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS plausible.imported_exit_pages
(
    site_id UInt64,
    date Date,
    exit_page String,
    visitors UInt64,
    exits UInt64,
    import_id UInt64,
    pageviews UInt64,
    bounces UInt32,
    visit_duration UInt64
)
ENGINE = MergeTree
ORDER BY (site_id, date, exit_page)
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS plausible.imported_entry_pages
(
    site_id UInt64,
    date Date,
    entry_page String,
    visitors UInt64,
    entrances UInt64,
    visit_duration UInt64,
    bounces UInt32,
    import_id UInt64,
    pageviews UInt64
)
ENGINE = MergeTree
ORDER BY (site_id, date, entry_page)
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS plausible.imported_devices
(
    site_id UInt64,
    date Date,
    device String,
    visitors UInt64,
    visits UInt64,
    visit_duration UInt64,
    bounces UInt32,
    import_id UInt64,
    pageviews UInt64
)
ENGINE = MergeTree
ORDER BY (site_id, date, device)
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS plausible.imported_custom_events
(
    site_id UInt64,
    import_id UInt64,
    date Date,
    name String CODEC(ZSTD(3)),
    link_url String CODEC(ZSTD(3)),
    path String CODEC(ZSTD(3)),
    visitors UInt64,
    events UInt64
)
ENGINE = MergeTree
ORDER BY (site_id, import_id, date, name)
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS plausible.imported_browsers
(
    site_id UInt64,
    date Date,
    browser String,
    visitors UInt64,
    visits UInt64,
    visit_duration UInt64,
    bounces UInt32,
    import_id UInt64,
    pageviews UInt64,
    browser_version String
)
ENGINE = MergeTree
ORDER BY (site_id, date, browser)
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS plausible.events_v2
(
    timestamp DateTime CODEC(Delta(4), LZ4),
    name LowCardinality(String),
    site_id UInt64,
    user_id UInt64,
    session_id UInt64,
    hostname String CODEC(ZSTD(3)),
    pathname String CODEC(ZSTD(3)),
    referrer String CODEC(ZSTD(3)),
    referrer_source String CODEC(ZSTD(3)),
    country_code FixedString(2),
    screen_size LowCardinality(String),
    operating_system LowCardinality(String),
    browser LowCardinality(String),
    utm_medium String CODEC(ZSTD(3)),
    utm_source String CODEC(ZSTD(3)),
    utm_campaign String CODEC(ZSTD(3)),
    `meta.key` Array(String) CODEC(ZSTD(3)),
    `meta.value` Array(String) CODEC(ZSTD(3)),
    browser_version LowCardinality(String),
    operating_system_version LowCardinality(String),
    subdivision1_code LowCardinality(String),
    subdivision2_code LowCardinality(String),
    city_geoname_id UInt32,
    utm_content String CODEC(ZSTD(3)),
    utm_term String CODEC(ZSTD(3)),
    revenue_reporting_amount Nullable(Decimal(18, 3)),
    revenue_reporting_currency FixedString(3),
    revenue_source_amount Nullable(Decimal(18, 3)),
    revenue_source_currency FixedString(3),
    scroll_depth UInt8,
    recovery_id UInt64,
    engagement_time UInt32,
    click_id_param LowCardinality(String),
    channel LowCardinality(String),
    
    -- ALIAS columns untuk kompatibilitas API Plausible
    source LowCardinality(String) ALIAS referrer_source,
    device LowCardinality(String) ALIAS screen_size,
    screen LowCardinality(String) ALIAS screen_size,
    os LowCardinality(String) ALIAS operating_system,
    os_version LowCardinality(String) ALIAS operating_system_version,
    country FixedString(2) ALIAS country_code,
    region LowCardinality(String) ALIAS subdivision1_code,
    city UInt32 ALIAS city_geoname_id
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(timestamp)
PRIMARY KEY (site_id, toDate(timestamp), name, user_id)
ORDER BY (site_id, toDate(timestamp), name, user_id, timestamp)
SAMPLE BY user_id
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS plausible.schema_migrations
(
    version Int64,
    inserted_at DateTime
)
ENGINE = TinyLog;

INSERT INTO plausible.schema_migrations (version, inserted_at) VALUES
(20200915070607,'2024-09-11 09:23:21'),
(20200918075025,'2024-09-11 09:23:21'),
(20201020083739,'2024-09-11 09:23:21'),
(20201106125234,'2024-09-11 09:23:21'),
(20210323130440,'2024-09-11 09:23:21'),
(20210712214034,'2024-09-11 09:23:21'),
(20211017093035,'2024-09-11 09:23:21'),
(20211112130238,'2024-09-11 09:23:21'),
(20220310104931,'2024-09-11 09:23:21'),
(20220404123000,'2024-09-11 09:23:21'),
(20220421161259,'2024-09-11 09:23:21'),
(20220422075510,'2024-09-11 09:23:21'),
(20230124140348,'2024-09-11 09:23:21'),
(20230210140348,'2024-09-11 09:23:21'),
(20230214114402,'2024-09-11 09:23:21'),
(20230320094327,'2024-09-11 09:23:21'),
(20230417104025,'2024-09-11 09:23:21'),
(20230509124919,'2024-09-11 09:23:21'),
(20231017073642,'2024-09-11 09:23:21'),
(20240123142959,'2024-09-11 09:23:21'),
(20240209085338,'2024-09-11 09:23:21'),
(20240220123656,'2024-09-11 09:23:21'),
(20240222082911,'2024-09-11 09:23:21'),
(20240305085310,'2024-09-11 09:23:21'),
(20240326134840,'2024-09-11 09:23:21'),
(20240327085855,'2024-09-11 09:23:21'),
(20240419133926,'2024-09-11 09:23:21'),
(20240423094014,'2024-09-11 09:23:21'),
(20240502115822,'2024-09-11 09:23:21'),
(20240709181437,'2024-09-11 09:23:22'),
(20240801091615,'2024-09-11 09:23:22'),
(20240829092858,'2024-09-11 09:23:22'),
(20241020114559,'2024-10-20 00:00:00'),
(20241028142653,'2024-10-28 00:00:00'),
(20250219093806,'2025-02-19 00:00:00'),
(20250316182725,'2025-03-16 00:00:00'),
(20251106111224,'2025-11-06 00:00:00');
