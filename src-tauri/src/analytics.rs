use serde::{Deserialize, Serialize};
use sqlx::Row;
use std::collections::HashMap;
use std::net::{IpAddr, Ipv4Addr, Ipv6Addr};
use tauri::State;
use tokio::sync::Mutex;

use crate::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct CountryViewCount {
    pub country: String,
    pub view_count: i64,
    pub percentage: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DailyViews {
    pub date: String,
    pub views: i64,
    pub unique_views: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BlogPostAnalytics {
    pub id: i32,
    pub title: String,
    pub total_views: i64,
    pub unique_ips: i64,
    pub country_breakdown: Vec<CountryViewCount>,
    pub daily_views: Vec<DailyViews>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ViewAnalytics {
    pub total_views: i64,
    pub total_unique_ips: i64,
    pub total_blog_posts: i64,
    pub country_breakdown: Vec<CountryViewCount>,
    pub blog_post_analytics: Vec<BlogPostAnalytics>,
    pub daily_views: Vec<DailyViews>,
}

#[derive(Debug, Clone)]
struct CidrBlock {
    network: IpAddr,
    prefix_len: u8,
    country: String,
}

impl CidrBlock {
    fn new(cidr: &str, country: &str) -> Option<Self> {
        let parts: Vec<&str> = cidr.split('/').collect();
        if parts.len() != 2 {
            return None;
        }

        let network = parts[0].parse().ok()?;
        let prefix_len = parts[1].parse().ok()?;

        Some(CidrBlock {
            network,
            prefix_len,
            country: country.to_string(),
        })
    }

    fn contains(&self, ip: IpAddr) -> bool {
        match (self.network, ip) {
            (IpAddr::V4(net), IpAddr::V4(addr)) => {
                let net_u32 = u32::from(net);
                let addr_u32 = u32::from(addr);
                let mask = (!0u32) << (32 - self.prefix_len);
                (net_u32 & mask) == (addr_u32 & mask)
            }
            (IpAddr::V6(net), IpAddr::V6(addr)) => {
                let net_u128 = u128::from(net);
                let addr_u128 = u128::from(addr);
                let mask = (!0u128) << (128 - self.prefix_len);
                (net_u128 & mask) == (addr_u128 & mask)
            }
            _ => false, // IPv4 vs IPv6 mismatch
        }
    }
}

struct GeoIpDatabase {
    cidr_blocks: Vec<CidrBlock>,
}

impl GeoIpDatabase {
    fn new() -> Self {
        let mut cidr_blocks = Vec::new();

        // Major CIDR blocks for countries - this is a simplified database
        // In production, you'd use a proper GeoIP database like MaxMind
        let country_cidrs = vec![
            // United States
            ("3.0.0.0/8", "United States"),
            ("4.0.0.0/8", "United States"),
            ("8.0.0.0/8", "United States"),
            ("9.0.0.0/8", "United States"),
            ("11.0.0.0/8", "United States"),
            ("18.0.0.0/8", "United States"),
            ("23.0.0.0/8", "United States"),
            ("34.0.0.0/8", "United States"),
            ("35.0.0.0/8", "United States"),
            ("44.0.0.0/8", "United States"),
            ("50.0.0.0/8", "United States"),
            ("52.0.0.0/8", "United States"),
            ("54.0.0.0/8", "United States"),
            ("64.0.0.0/10", "United States"),
            ("66.0.0.0/8", "United States"),
            ("98.0.0.0/8", "United States"),
            ("100.64.0.0/10", "United States"),
            ("107.0.0.0/8", "United States"),
            ("108.0.0.0/8", "United States"),
            ("184.0.0.0/8", "United States"),
            ("206.0.0.0/8", "United States"),
            ("207.0.0.0/8", "United States"),
            // Canada
            ("24.0.0.0/8", "Canada"),
            ("51.0.0.0/8", "Canada"),
            ("142.0.0.0/8", "Canada"),
            ("144.0.0.0/8", "Canada"),
            ("149.0.0.0/8", "Canada"),
            ("158.0.0.0/8", "Canada"),
            ("167.0.0.0/8", "Canada"),
            ("192.99.0.0/16", "Canada"),
            // United Kingdom
            ("80.85.0.0/16", "Ireland"), // More specific
            ("195.0.0.0/8", "United Kingdom"),
            ("212.0.0.0/8", "United Kingdom"),
            // Germany
            ("91.0.0.0/8", "Germany"),
            ("94.0.0.0/8", "Germany"),
            // France
            ("212.0.0.0/8", "France"),
            ("213.0.0.0/8", "France"),
            // Netherlands
            ("185.0.0.0/8", "Netherlands"),
            // China - Major blocks
            ("43.0.0.0/8", "China"),
            ("49.0.0.0/8", "China"),
            ("101.0.0.0/8", "China"),
            ("111.0.0.0/8", "China"),
            ("119.0.0.0/8", "China"),
            ("124.0.0.0/8", "China"),
            ("129.0.0.0/8", "China"),
            ("170.0.0.0/8", "China"),
            // Japan
            ("106.0.0.0/8", "Japan"),
            ("122.0.0.0/8", "Japan"),
            ("182.0.0.0/8", "Japan"),
            ("223.0.0.0/8", "Japan"),
            // Russia
            ("5.0.0.0/8", "Russia"),
            ("87.0.0.0/8", "Russia"),
            ("95.0.0.0/8", "Russia"),
            ("213.0.0.0/8", "Russia"),
            // Australia
            ("162.0.0.0/8", "Australia"),
            ("166.0.0.0/8", "Australia"),
            // Brazil
            ("189.0.0.0/8", "Brazil"),
            ("190.0.0.0/8", "Brazil"),
            // South Africa
            ("41.0.0.0/8", "South Africa"),
            ("102.0.0.0/8", "South Africa"),
            ("105.0.0.0/8", "South Africa"),
            ("154.0.0.0/8", "South Africa"),
            ("197.0.0.0/8", "South Africa"),
            // Singapore
            ("47.0.0.0/8", "Singapore"),
            // European IPv6 blocks
            ("2a00::/12", "Europe"),
            ("2a01::/16", "Europe"),
            ("2a02::/16", "Europe"),
            ("2a03::/16", "Europe"),
            ("2a04::/16", "Europe"),
            ("2a05::/16", "Europe"),
            ("2a06::/16", "Europe"),
            ("2a07::/16", "Europe"),
            ("2a08::/16", "Europe"),
            ("2a09::/16", "Europe"),
            ("2a0a::/16", "Europe"),
            ("2a0b::/16", "Europe"),
            ("2a0c::/16", "Europe"),
            ("2a0d::/16", "Europe"),
            ("2a0e::/16", "Europe"),
            ("2a0f::/16", "Europe"),
            // US IPv6 blocks
            ("2600::/12", "United States"),
            ("2604::/16", "United States"),
            ("2605::/16", "United States"),
            ("2607::/16", "United States"),
            ("2610::/16", "United States"),
            // China IPv6
            ("2400::/12", "China"),
            ("2404::/16", "China"),
            ("2408::/16", "China"),
            ("2409::/16", "China"),
            // Private networks
            ("10.0.0.0/8", "Private Network"),
            ("172.16.0.0/12", "Private Network"),
            ("192.168.0.0/16", "Private Network"),
            ("127.0.0.0/8", "Local"),
            ("::1/128", "Local"),
            ("fc00::/7", "Private Network"),
            ("fe80::/10", "Link Local"),
        ];

        for (cidr, country) in country_cidrs {
            if let Some(block) = CidrBlock::new(cidr, country) {
                cidr_blocks.push(block);
            }
        }

        // Sort by prefix length (most specific first)
        cidr_blocks.sort_by(|a, b| b.prefix_len.cmp(&a.prefix_len));

        GeoIpDatabase { cidr_blocks }
    }

    fn lookup_country(&self, ip_str: &str) -> String {
        // Handle localhost specially
        if ip_str == "127.0.0.1" || ip_str == "localhost" || ip_str == "::1" {
            return "Local".to_string();
        }

        // Parse IP address
        let ip = match ip_str.parse::<IpAddr>() {
            Ok(ip) => ip,
            Err(_) => return "Invalid IP".to_string(),
        };

        // Find matching CIDR block (most specific first due to sorting)
        for block in &self.cidr_blocks {
            if block.contains(ip) {
                return block.country.clone();
            }
        }

        "Unknown".to_string()
    }
}

// Initialize the GeoIP database once
lazy_static::lazy_static! {
    static ref GEOIP_DB: GeoIpDatabase = GeoIpDatabase::new();
}

fn ip_to_country(ip: &str) -> String {
    GEOIP_DB.lookup_country(ip)
}

#[tauri::command]
pub async fn get_view_analytics(
    state: State<'_, Mutex<AppState>>,
    days: Option<i32>,
) -> Result<ViewAnalytics, String> {
    let state = state.lock().await;
    let pool = state.pool.as_ref().ok_or("Database not connected")?;

    // Build the date filter based on days parameter
    let date_condition = match days {
        Some(0) => "viewed_at IS NOT NULL".to_string(), // All time
        Some(d) => format!("viewed_at >= NOW() - INTERVAL '{} days'", d),
        None => "viewed_at >= NOW() - INTERVAL '30 days'".to_string(), // Default to 30 days
    };

    // Get all views with blog post info
    let views_query = format!(
        r#"
        SELECT
            bpi.id,
            bpi.blog_post_id,
            bpi.ip_address,
            bp.title as blog_title
        FROM tadgh_blog.blog_post_ips bpi
        JOIN tadgh_blog.blog_posts bp ON bpi.blog_post_id = bp.id
        WHERE {}
        ORDER BY bpi.id
        "#,
        date_condition
    );

    let views = sqlx::query(&views_query)
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;

    // Get total statistics
    let total_stats_query = format!(
        r#"
        SELECT
            COUNT(*) as total_views,
            COUNT(DISTINCT ip_address) as unique_ips,
            COUNT(DISTINCT blog_post_id) as total_posts
        FROM tadgh_blog.blog_post_ips
        WHERE {}
        "#,
        date_condition
    );

    let total_stats = sqlx::query(&total_stats_query)
        .fetch_one(pool)
        .await
        .map_err(|e| e.to_string())?;

    let total_views: i64 = total_stats.try_get("total_views").unwrap_or(0);
    let total_unique_ips: i64 = total_stats.try_get("unique_ips").unwrap_or(0);
    let total_blog_posts: i64 = total_stats.try_get("total_posts").unwrap_or(0);

    // Get daily views for the specified period
    let daily_views_query = format!(
        r#"
        SELECT
            DATE(viewed_at) as view_date,
            COUNT(*) as total_views,
            COUNT(DISTINCT ip_address) as unique_views
        FROM tadgh_blog.blog_post_ips
        WHERE {}
        GROUP BY DATE(viewed_at)
        ORDER BY view_date DESC
        "#,
        date_condition
    );

    let daily_views_result = sqlx::query(&daily_views_query)
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;

    let daily_views: Vec<DailyViews> = daily_views_result
        .into_iter()
        .map(|row| DailyViews {
            date: row
                .try_get::<chrono::NaiveDate, _>("view_date")
                .map(|d| d.to_string())
                .unwrap_or_else(|_| "Unknown".to_string()),
            views: row.try_get("total_views").unwrap_or(0),
            unique_views: row.try_get("unique_views").unwrap_or(0),
        })
        .collect();

    // Process country data and blog post data from the filtered views
    let mut country_counts: HashMap<String, i64> = HashMap::new();
    let mut blog_post_data: HashMap<i32, (String, HashMap<String, i64>, i64)> = HashMap::new();

    for view in views {
        let ip_address: String = view.try_get("ip_address").unwrap_or_default();
        let blog_post_id: i32 = view.try_get("blog_post_id").unwrap_or(0);
        let blog_title: String = view.try_get("blog_title").unwrap_or_default();

        let country = ip_to_country(&ip_address);

        // Global country count
        *country_counts.entry(country.clone()).or_insert(0) += 1;

        // Per blog post data
        let entry = blog_post_data
            .entry(blog_post_id)
            .or_insert((blog_title, HashMap::new(), 0));

        entry.1.entry(country.clone()).or_insert(0);
        *entry.1.get_mut(&country).unwrap() += 1;
        entry.2 += 1;
    }

    // Convert to sorted country breakdown
    let mut country_breakdown: Vec<CountryViewCount> = country_counts
        .into_iter()
        .map(|(country, count)| CountryViewCount {
            country,
            view_count: count,
            percentage: if total_views > 0 {
                (count as f64 / total_views as f64) * 100.0
            } else {
                0.0
            },
        })
        .collect();

    country_breakdown.sort_by(|a, b| b.view_count.cmp(&a.view_count));

    // Convert blog post data with daily views for each post
    let mut blog_post_analytics: Vec<BlogPostAnalytics> = Vec::new();

    for (id, (title, countries, total_views)) in blog_post_data {
        let mut country_breakdown: Vec<CountryViewCount> = countries
            .into_iter()
            .map(|(country, count)| CountryViewCount {
                country,
                view_count: count,
                percentage: if total_views > 0 {
                    (count as f64 / total_views as f64) * 100.0
                } else {
                    0.0
                },
            })
            .collect();

        country_breakdown.sort_by(|a, b| b.view_count.cmp(&a.view_count));

        // Get daily views for this specific blog post with the same date condition
        let blog_daily_views_query = format!(
            r#"
            SELECT
                DATE(viewed_at) as view_date,
                COUNT(*) as total_views,
                COUNT(DISTINCT ip_address) as unique_views
            FROM tadgh_blog.blog_post_ips
            WHERE blog_post_id = $1 AND {}
            GROUP BY DATE(viewed_at)
            ORDER BY view_date DESC
            "#,
            date_condition
        );

        let blog_daily_views_result = sqlx::query(&blog_daily_views_query)
            .bind(id)
            .fetch_all(pool)
            .await
            .map_err(|e| e.to_string())?;

        let blog_daily_views: Vec<DailyViews> = blog_daily_views_result
            .into_iter()
            .map(|row| DailyViews {
                date: row
                    .try_get::<chrono::NaiveDate, _>("view_date")
                    .map(|d| d.to_string())
                    .unwrap_or_else(|_| "Unknown".to_string()),
                views: row.try_get("total_views").unwrap_or(0),
                unique_views: row.try_get("unique_views").unwrap_or(0),
            })
            .collect();

        blog_post_analytics.push(BlogPostAnalytics {
            id,
            title,
            total_views,
            unique_ips: 0,
            country_breakdown,
            daily_views: blog_daily_views,
        });
    }

    blog_post_analytics.sort_by(|a, b| b.total_views.cmp(&a.total_views));

    Ok(ViewAnalytics {
        total_views,
        total_unique_ips,
        total_blog_posts,
        country_breakdown,
        blog_post_analytics,
        daily_views,
    })
}
