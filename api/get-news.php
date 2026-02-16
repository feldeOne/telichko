<?php
/**
 * News API Integration for Medical News Section
 * Fetches latest medical news from NewsAPI.org
 */

// CORS Headers for local development
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Configuration
require_once __DIR__ . '/config.php';

// Check if API key is configured
if (!defined('NEWSAPI_KEY') || NEWSAPI_KEY === 'YOUR_API_KEY_HERE') {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'NewsAPI key not configured. Please add your API key to api/config.php'
    ]);
    exit;
}

// Cache configuration
$cacheFile = __DIR__ . '/cache/news_cache.json';
$cacheTime = 3600; // Cache for 1 hour

// Check if cache exists and is still valid
if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTime)) {
    // Return cached data
    $cachedData = file_get_contents($cacheFile);
    echo $cachedData;
    exit;
}

// NewsAPI.org configuration
$apiKey = NEWSAPI_KEY;
$language = 'de'; // German language
$pageSize = 8; // Fetch a few more to ensure we get 6 good ones after filtering

// Medical keywords for German search - diverse terms for different categories
$keywords = 'eRezept OR Telemedizin OR "Digitale Gesundheit" OR "KI Medizin" OR "künstliche Intelligenz Gesundheit" OR Medizintechnik OR "Gesundheits App" OR "medizinische Forschung" OR Wearable OR Gesundheitsdaten';

// Build API URL
$apiUrl = "https://newsapi.org/v2/everything?" . http_build_query([
    'q' => $keywords,
    'language' => $language,
    'sortBy' => 'publishedAt',
    'pageSize' => $pageSize,
    'apiKey' => $apiKey
]);

// Fetch news from API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'Praxis-Telichko-News/1.0');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json'
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
// Note: curl_close() is deprecated in PHP 8.5+, not calling it anymore

// Check for errors
if ($httpCode !== 200) {
    $data = json_decode($response, true);
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Failed to fetch news from NewsAPI',
        'httpCode' => $httpCode,
        'apiMessage' => $data['message'] ?? 'No error message',
        'apiUrl' => preg_replace('/apiKey=[^&]+/', 'apiKey=***', $apiUrl) // Hide API key
    ]);
    exit;
}

$data = json_decode($response, true);

// Check if API returned error
if (isset($data['status']) && $data['status'] === 'error') {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $data['message'] ?? 'Unknown API error',
        'code' => $data['code'] ?? 'unknown'
    ]);
    exit;
}

// Transform articles for frontend
$articles = [];
if (isset($data['articles']) && is_array($data['articles'])) {
    foreach ($data['articles'] as $index => $article) {
        $category = determineCategory($article['title'] . ' ' . $article['description']);

        $articles[] = [
            'title' => $article['title'],
            'description' => $article['description'] ?? '',
            'url' => $article['url'],
            'publishedAt' => $article['publishedAt'],
            'source' => $article['source']['name'] ?? 'Unbekannt',
            'category' => $category,
            'isFeatured' => $index === 0, // First article is featured
            'imageUrl' => $article['urlToImage'] ?? null
        ];
    }
}

// Limit to 6 articles maximum (2 rows of 3 cards)
$articles = array_slice($articles, 0, 6);

$result = [
    'success' => true,
    'articles' => $articles,
    'totalResults' => count($articles),
    'fetchedAt' => date('Y-m-d H:i:s')
];

// Save to cache
if (!is_dir(__DIR__ . '/cache')) {
    mkdir(__DIR__ . '/cache', 0755, true);
}
file_put_contents($cacheFile, json_encode($result));

// Return result
echo json_encode($result);

/**
 * Determine article category based on content
 */
function determineCategory($text) {
    $text = strtolower($text);

    // KI & Forschung - check first because it's more specific
    if (preg_match('/(künstliche\s*intelligenz|ki[-\s]?system|chatgpt|gpt|ai|machine\s*learning|deep\s*learning|algorithmus|forschung|studie|wissenschaft|klinische\s*studie|genom|neural|medizinische\s*forschung)/i', $text)) {
        return 'ki-forschung';
    }

    // MedTech
    if (preg_match('/(medtech|medizintechnik|wearable|fitness[-\s]?tracker|smart[-\s]?watch|smartwatch|smart[-\s]?brille|smarte\s*brille|ar[-\s]?brille|sensor|gesundheits[-\s]?monitor|medical\s*device|implantat|health\s*tracker|health[-\s]?wearable)/i', $text)) {
        return 'medtech';
    }

    // Digital Health
    if (preg_match('/(e-rezept|erezept|digitale?\s*gesundheit|telemedizin|videosprechstunde|gesundheits[-\s]?app|telematik[-\s]?infrastruktur|epa|elektronische\s*patientenakte|online[-\s]?sprechstunde|digital\s*health|apple\s*health|gesundheitsdaten)/i', $text)) {
        return 'digital-health';
    }

    // Gesundheitssystem (default and specific)
    if (preg_match('/(gesundheitssystem|gesundheitswesen|krankenkasse|gkv|pkv|krankenversicherung|gesundheitsminister|reform|klinik|krankenhaus|arzt|pflege|patient)/i', $text)) {
        return 'gesundheitssystem';
    }

    return 'gesundheitssystem'; // Default category
}
