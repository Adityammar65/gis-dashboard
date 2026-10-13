<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="{{ asset('public/Assets/Logo.png') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="https://tile.openstreetmap.org">
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" as="style">

    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>GIS Dashboard</title>
    <script>
        try {
            if (localStorage.getItem('gis_theme') === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.style.colorScheme = 'dark';
            } else {
                document.documentElement.style.colorScheme = 'light';
            }
        } catch (e) {}
    </script>
    @viteReactRefresh
    @vite('resources/js/app.jsx')

    @inertiaHead
</head>
<body class="bg-white text-gray-900 antialiased dark:bg-night-950 dark:text-night-200">
    @inertia
</body>
</html>
