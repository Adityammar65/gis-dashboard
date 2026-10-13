@php
    $warnaJudul = '#6F2424';
@endphp

<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <style>
        @page {
            margin: 20mm 10mm 18mm 10mm;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 7.5px;
            color: #1f2937;
            margin: 0;
            padding: 0;
        }

        .kop {
            border-bottom: 2px solid {{ $warnaJudul }};
            padding-bottom: 6px;
            margin-bottom: 10px;
        }

        .kop-judul {
            font-size: 15px;
            font-weight: bold;
            color: {{ $warnaJudul }};
            margin: 0;
        }

        .kop-sub {
            font-size: 8px;
            color: #4b5563;
            margin: 3px 0 0;
        }

        .kop-filter {
            font-size: 7.5px;
            color: #6b7280;
            margin: 2px 0 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        thead th {
            background-color: {{ $warnaJudul }};
            color: #ffffff;
            font-size: 7.5px;
            font-weight: bold;
            text-align: center;
            padding: 5px 3px;
            border: 1px solid #ffffff;
        }

        thead {
            display: table-header-group;
        }

        tbody td {
            font-size: 7.5px;
            padding: 4px 3px;
            border: 1px solid #d9d9d9;
            vertical-align: top;
            word-wrap: break-word;
        }

        tbody tr:nth-child(even) {
            background-color: #fafafa;
        }

        .rata {
            text-align: center;
        }

        .kiri {
            text-align: left;
        }

        a {
            color: #1d4ed8;
            text-decoration: underline;
        }

        .kosong {
            padding: 14px;
            text-align: center;
            color: #6b7280;
            font-size: 8px;
        }
    </style>
</head>

<body>

    <div class="kop">
        <p class="kop-judul">{{ strtoupper($meta['judul']) }}</p>
        <p class="kop-sub">
            Wilayah: {{ $meta['namaWilayah'] }}
            &nbsp;|&nbsp; Dicetak: {{ $meta['waktu'] }}
            &nbsp;|&nbsp;
            @if (($meta['cakupan'] ?? 'halaman') === 'semua')
                Semua data
            @else
                Halaman {{ $meta['halaman'] }} dari {{ $meta['totalHalaman'] }}
            @endif
            &nbsp;|&nbsp; Total data: {{ $meta['totalData'] }} data
        </p>

        @if (!empty($meta['filter']))
            <p class="kop-filter">Filter: {{ implode('  |  ', $meta['filter']) }}</p>
        @endif
    </div>

    <table>
        <colgroup>
            @foreach ($headers as $index => $header)
                @php
                    $lebar = match ($index) {
                        0 => '3.5%',
                        1 => '10%',
                        2, 3, 4 => '8%',
                        5 => '19%',
                        6, 7 => '6%',
                        8 => '9%',
                        9 => '6%',
                        10, 11 => '7.5%',
                        default => '6.5%',
                    };
                @endphp
                <col style="width: {{ $lebar }}">
            @endforeach
        </colgroup>

        <thead>
            <tr>
                @foreach ($headers as $header)
                    <th>{{ $header }}</th>
                @endforeach
            </tr>
        </thead>

        <tbody>
            @forelse ($baris as $row)
                <tr>
                    <td class="rata">{{ $row['no'] }}</td>
                    <td class="kiri">{{ $row['kode'] }}</td>
                    <td class="kiri">{{ $row['wilayah'] }}</td>
                    <td class="kiri">{{ $row['kecamatan'] }}</td>
                    <td class="kiri">{{ $row['kelurahan'] }}</td>
                    <td class="kiri">{{ $row['deskripsi'] }}</td>
                    <td class="rata">{{ $row['latitude'] !== '' ? $row['latitude'] : '-' }}</td>
                    <td class="rata">{{ $row['longitude'] !== '' ? $row['longitude'] : '-' }}</td>
                    <td class="kiri">{{ $row['petugas'] }}</td>
                    <td class="rata">{{ $row['status'] }}</td>
                    <td class="rata">{{ $row['dibuat'] }}</td>
                    <td class="rata">{{ $row['diperbarui'] }}</td>
                    <td class="rata">
                        @if ($row['peta'] !== '')
                            <a href="{{ $row['peta'] }}">Lihat Peta</a>
                        @else
                            -
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td class="kosong" colspan="{{ $jumlahKolom }}">
                        Tidak ada data yang sesuai dengan filter saat ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <script type="text/php">
        $pdf->getCanvas()->page_text(function ($canvas, $font) {
            $text = 'Halaman ' . $canvas->get_page_number() . ' dari ' . $canvas->get_page_count();
            $canvas->text(807, 578, $text, $font, 7, 0, 'right');
        });
    </script>

</body>

</html>
