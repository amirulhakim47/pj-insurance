<?php
/**
 * PHP Reverse Proxy for Node.js Backend
 * Routes /api/* requests to localhost:3001 internally
 */

$backend = 'http://127.0.0.1:3001';

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// Strip the basePath prefix if present (e.g., /pj-insurance/api/... → /api/...)
$path = preg_replace('#^/pj-insurance#', '', $path);

// Build target URL
$url = $backend . $path;

// Collect request headers to forward
$forwardHeaders = [];
$skipHeaders = ['host', 'connection', 'content-length', 'transfer-encoding'];

foreach (getallheaders() as $key => $value) {
    if (!in_array(strtolower($key), $skipHeaders)) {
        $forwardHeaders[] = "$key: $value";
    }
}

// Add X-Forwarded headers
$forwardHeaders[] = 'X-Forwarded-For: ' . ($_SERVER['REMOTE_ADDR'] ?? '');
$forwardHeaders[] = 'X-Forwarded-Proto: ' . (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http');

// Get request body for POST/PUT/PATCH
$body = null;
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $body = file_get_contents('php://input');
}

// Make the request via cURL
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_HTTPHEADER => $forwardHeaders,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_FOLLOWLOCATION => false,
]);

if ($body !== null) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$error = curl_error($ch);
curl_close($ch);

// Handle cURL errors
if ($response === false) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 502,
        'code' => 'PROXY_ERROR',
        'message' => 'Backend unreachable: ' . $error,
    ]);
    exit;
}

// Split response into headers and body
$responseHeaders = substr($response, 0, $headerSize);
$responseBody = substr($response, $headerSize);

// Forward response headers (skip hop-by-hop headers)
$skipResponseHeaders = ['transfer-encoding', 'connection', 'keep-alive'];
foreach (explode("\r\n", $responseHeaders) as $i => $header) {
    if ($i === 0) continue; // Skip HTTP status line
    if (empty(trim($header))) continue;

    $parts = explode(':', $header, 2);
    if (count($parts) === 2 && !in_array(strtolower(trim($parts[0])), $skipResponseHeaders)) {
        header($header, false);
    }
}

// Set response code and output body
http_response_code($httpCode);
echo $responseBody;
