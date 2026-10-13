<?php

namespace Tests\Feature;

use App\Services\ImageService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (! ImageService::isWebPSupported()) {
            $this->markTestSkipped('No WebP encoder (cwebp or ImageMagick) available on this host.');
        }

        Storage::fake('public');
    }

    public function test_it_stores_a_webp_with_a_uuid_filename(): void
    {
        $path = $this->store(UploadedFile::fake()->image('tiang.jpg', 800, 600), 'tiang');

        $this->assertStringStartsWith('tiang/', $path);
        $this->assertStringEndsWith('.webp', $path);
        $this->assertMatchesRegularExpression(
            '/^tiang\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/',
            $path
        );

        Storage::disk('public')->assertExists($path);
    }

    public function test_output_is_a_structurally_valid_webp(): void
    {
        $path = $this->store(UploadedFile::fake()->image('tiang.jpg', 800, 600), 'tiang');

        $contents = Storage::disk('public')->get($path);

        $this->assertSame('RIFF', substr($contents, 0, 4));
        $this->assertSame('WEBP', substr($contents, 8, 4));
        $this->assertSame('image/webp', getimagesizefromstring($contents)['mime']);
    }

    public function test_landscape_image_is_capped_on_its_longest_side(): void
    {
        $path = $this->store(UploadedFile::fake()->image('tiang.jpg', 3000, 2000), 'tiang');

        [$width, $height] = $this->dimensions($path);

        $this->assertSame(1600, $width);
        $this->assertSame(1066, $height, 'Aspect ratio should be preserved (3:2).');
    }

    public function test_portrait_image_is_capped_on_its_height(): void
    {
        $path = $this->store(UploadedFile::fake()->image('tiang.jpg', 2000, 3000), 'tiang');

        [$width, $height] = $this->dimensions($path);

        $this->assertSame(1600, $height);
        $this->assertSame(1066, $width, 'Aspect ratio should be preserved (2:3).');
    }

    public function test_image_within_the_cap_keeps_its_original_dimensions(): void
    {
        $path = $this->store(UploadedFile::fake()->image('tiang.jpg', 1024, 768), 'tiang');

        $this->assertSame([1024, 768], $this->dimensions($path));
    }

    public function test_image_exactly_at_the_cap_is_not_resized(): void
    {
        $path = $this->store(UploadedFile::fake()->image('tiang.jpg', 1600, 1200), 'tiang');

        $this->assertSame([1600, 1200], $this->dimensions($path));
    }

    public function test_image_is_never_upscaled(): void
    {
        $path = $this->store(UploadedFile::fake()->image('tiang.jpg', 400, 300), 'tiang');

        $this->assertSame([400, 300], $this->dimensions($path));
    }

    public function test_max_longest_side_is_configurable(): void
    {
        config(['image.max_longest_side' => 800]);

        $path = $this->store(UploadedFile::fake()->image('tiang.jpg', 3000, 2000), 'tiang');

        $this->assertSame([800, 533], $this->dimensions($path));
    }

    public function test_exif_orientation_is_preserved_so_photos_display_upright(): void
    {
        $file = $this->jpegWithExifOrientation(6);

        $path = $this->store($file, 'tiang');

        $contents = Storage::disk('public')->get($path);

        $this->assertStringContainsString(
            'EXIF',
            $contents,
            'cwebp must keep the EXIF chunk, otherwise rotated photos display sideways.'
        );
        $this->assertSame(6, $this->exifOrientation($contents));
    }

    public function test_orientation_is_flattened_by_the_magick_fallback(): void
    {
        config(['image.fallbacks' => ['magick']]);

        if (! app(ImageService::class)->hasEncoder('magick')) {
            $this->markTestSkipped('ImageMagick CLI not available on this host.');
        }

        $file = $this->jpegWithExifOrientation(6);

        $path = $this->store($file, 'tiang');

        $contents = Storage::disk('public')->get($path);

        $this->assertSame('RIFF', substr($contents, 0, 4));
        $this->assertSame('WEBP', substr($contents, 8, 4));
        $this->assertStringNotContainsString(
            'EXIF',
            $contents,
            'magick bakes the rotation into the pixels, so no EXIF tag should remain.'
        );
    }

    public function test_png_with_transparency_keeps_its_alpha_channel(): void
    {
        $path = $this->store($this->pngWithTransparency(), 'tiang');

        $contents = Storage::disk('public')->get($path);

        $this->assertSame('image/webp', getimagesizefromstring($contents)['mime']);
        $this->assertStringContainsString(
            'ALPH',
            $contents,
            'A lossless alpha channel chunk should survive the conversion.'
        );
    }

    public function test_it_creates_the_target_directory(): void
    {
        $path = $this->store(UploadedFile::fake()->image('tiang.jpg', 800, 600), 'nested/dir');

        $this->assertStringStartsWith('nested/dir/', $path);
        Storage::disk('public')->assertExists($path);
    }

    public function test_it_rejects_a_file_that_cannot_be_read(): void
    {
        $this->expectException(\RuntimeException::class);

        $file = UploadedFile::fake()->create('broken.jpg', 10);
        $file->getRealPath();

        app(ImageService::class)->storeOptimizedWebP($file, 'tiang');
    }

    public function test_stored_image_is_smaller_in_bytes_than_the_source(): void
    {
        $source = UploadedFile::fake()->image('tiang.jpg', 3000, 2000);

        $path = $this->store($source, 'tiang');

        $stored = Storage::disk('public')->get($path);

        $this->assertLessThan(
            $source->getSize(),
            is_string($stored) ? strlen($stored) : $stored->size(),
            'WebP should compress the source rather than inflate it.'
        );
    }

    /**
     * Run the service and return the stored path.
     */
    private function store(UploadedFile $file, string $directory): string
    {
        return app(ImageService::class)->storeOptimizedWebP($file, $directory);
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function dimensions(string $path): array
    {
        $size = getimagesizefromstring(Storage::disk('public')->get($path));

        return [(int) $size[0], (int) $size[1]];
    }

    /**
     * Build a JPEG carrying the given EXIF orientation tag.
     */
    private function jpegWithExifOrientation(int $orientation): UploadedFile
    {
        $width = 40;
        $height = 80;

        $image = imagecreatetruecolor($width, $height);
        imagefilledrectangle($image, 0, 0, $width, $height, imagecolorallocate($image, 200, 10, 10));
        imagefilledrectangle($image, 0, 0, 12, $height, imagecolorallocate($image, 10, 10, 220));

        ob_start();
        imagejpeg($image, null, 92);
        $jpeg = (string) ob_get_clean();
        imagedestroy($image);

        $tiff = "MM\x00\x2a\x00\x00\x00\x08"
            .pack('n', 1)              // one directory entry
            .pack('n', 0x0112)         // Orientation
            .pack('n', 3)              // SHORT
            .pack('N', 1)              // value count
            .pack('n', $orientation)
            .pack('n', 0)              // next IFD offset
            .pack('N', 0);

        $payload = "Exif\x00\x00".$tiff;
        $app1 = "\xFF\xE1".pack('n', strlen($payload) + 2).$payload;

        $withExif = "\xFF\xD8".$app1.substr($jpeg, 2);

        $path = tempnam(sys_get_temp_dir(), 'exif').'.jpg';
        file_put_contents($path, $withExif);

        return new UploadedFile($path, 'rotated.jpg', 'image/jpeg', null, true);
    }

    /**
     * Read the EXIF orientation back out of a WebP EXIF chunk.
     */
    private function exifOrientation(string $webp): ?int
    {
        if (! $this->exifChunk($webp, $chunk)) {
            return null;
        }

        $tiff = substr($chunk, 6);

        $hasByteOrderMark = in_array(substr($tiff, 0, 2), ['II', 'MM'], true);

        $littleEndian = match (substr($tiff, 0, 2)) {
            'II' => true,
            'MM' => false,
            default => null,
        };

        if ($hasByteOrderMark && $littleEndian !== null) {
            $count = $littleEndian
                ? unpack('v', substr($tiff, 8, 2))[1]
                : unpack('n', substr($tiff, 8, 2))[1];

            for ($i = 0; $i < $count; $i++) {
                $entry = 12 + ($i * 12);
                $tag = $littleEndian
                    ? unpack('v', substr($tiff, $entry, 2))[1]
                    : unpack('n', substr($tiff, $entry, 2))[1];

                if ($tag === 0x0112) {
                    return $littleEndian
                        ? unpack('v', substr($tiff, $entry + 8, 2))[1]
                        : unpack('n', substr($tiff, $entry + 8, 2))[1];
                }
            }

            return null;
        }

        foreach ([true, false] as $little) {
            $read = fn (int $at): int => $little
                ? unpack('v', substr($tiff, $at, 2))[1]
                : unpack('n', substr($tiff, $at, 2))[1];

            $length = strlen($tiff);

            for ($at = 0; $at + 12 <= $length; $at += 2) {
                if ($read($at) !== 0x0112) {
                    continue;
                }

                $type = $read($at + 2);
                if ($type !== 3) {
                    continue;
                }

                return $read($at + 8);
            }
        }

        return null;
    }

    public function test_quality_stays_above_the_configured_floor(): void
    {
        $source = $this->photoLikeJpeg(1200, 800);

        $path = $this->store($source, 'tiang');

        $stored = Storage::disk('public')->get($path);
        $target = [
            (int) config('image.max_longest_side'),
            (int) config('image.max_longest_side'),
        ];

        $reference = $this->lanczosReference($source, 1200, 800, $target);

        $psnr = $this->psnr($reference, $stored);

        $this->assertGreaterThan(
            33.0,
            $psnr,
            sprintf('Encoded quality regressed: PSNR %.2f dB is below the acceptable floor.', $psnr)
        );
    }

    public function test_quality_setting_is_honoured(): void
    {
        $source = $this->photoLikeJpeg(1200, 800);

        config(['image.quality' => 20]);
        $lowPath = $this->store($source, 'tiang');
        $low = Storage::disk('public')->get($lowPath);
        $lowPsnr = $this->psnr($this->lanczosReference($source, 1200, 800, [1600, 1600]), $low);

        config(['image.quality' => 95]);
        $highPath = $this->store($source, 'tiang');
        $high = Storage::disk('public')->get($highPath);
        $highPsnr = $this->psnr($this->lanczosReference($source, 1200, 800, [1600, 1600]), $high);

        $this->assertLessThan(
            strlen($high),
            strlen($low),
            'A higher quality setting must not produce a smaller file.'
        );
        $this->assertGreaterThan(
            $lowPsnr,
            $highPsnr,
            sprintf('A higher quality setting must score better (low %.2f dB, high %.2f dB).', $lowPsnr, $highPsnr)
        );
    }

    public function test_quality_defaults_to_85(): void
    {
        $this->assertSame(85, (int) config('image.quality'));
    }

    public function test_encoder_is_reported_as_a_usable_webp(): void
    {
        $path = $this->store(UploadedFile::fake()->image('tiang.jpg', 1200, 800), 'tiang');

        $contents = Storage::disk('public')->get($path);

        $this->assertSame('RIFF', substr($contents, 0, 4), 'Not a RIFF container.');
        $this->assertSame('WEBP', substr($contents, 8, 4), 'Not a WebP payload.');
        $this->assertNotFalse(
            getimagesizefromstring($contents),
            'The stored file must decode as an image, not merely carry a WebP header.'
        );
    }

    public function test_output_decodes_and_matches_the_requested_dimensions(): void
    {
        $path = $this->store(UploadedFile::fake()->image('tiang.jpg', 3000, 2000), 'tiang');

        $size = getimagesizefromstring(Storage::disk('public')->get($path));

        $this->assertIsArray($size, 'The stored file must decode as a real image.');
        $this->assertSame('image/webp', $size['mime']);
        $this->assertSame([1600, 1066], [(int) $size[0], (int) $size[1]]);
    }

    /**
     * Build a JPEG with gradients, noise and hard edges.
     */
    private function photoLikeJpeg(int $width, int $height): UploadedFile
    {
        $image = imagecreatetruecolor($width, $height);

        for ($y = 0; $y < $height; $y++) {
            $r = (int) (127 + 120 * sin($y / 40));
            $g = (int) (127 + 120 * sin($y / 17 + 1));
            $b = (int) (127 + 120 * sin($y / 7 + 2));

            $color = imagecolorallocate($image, max(0, min(255, $r)), max(0, min(255, $g)), max(0, min(255, $b)));
            imageline($image, 0, $y, $width, $y, $color);
        }

        for ($i = 0; $i < $width * $height / 12; $i++) {
            $x = mt_rand(0, $width - 1);
            $y = mt_rand(0, $height - 1);
            $v = mt_rand(0, 255);
            imagesetpixel($image, $x, $y, imagecolorallocate($image, $v, $v, $v));
        }

        imagefilledrectangle($image, 40, 40, 220, 90, imagecolorallocate($image, 255, 255, 255));
        imagefilledrectangle($image, 40, 40, 90, 260, imagecolorallocate($image, 0, 0, 0));

        ob_start();
        imagejpeg($image, null, 95);
        $jpeg = (string) ob_get_clean();
        imagedestroy($image);

        $path = tempnam(sys_get_temp_dir(), 'photo').'.jpg';
        file_put_contents($path, $jpeg);

        return new UploadedFile($path, 'photo.jpg', 'image/jpeg', null, true);
    }

    /**
     * Best-effort Lanczos downscale, used as the fidelity yardstick.
     */
    private function lanczosReference(UploadedFile $source, int $srcW, int $srcH, array $max): string
    {
        $bin = trim((string) @shell_exec('command -v magick 2>/dev/null'));
        if ($bin === '') {
            $this->markTestSkipped('ImageMagick is required to build the fidelity reference.');
        }

        $src = $source->getRealPath();
        $longest = max($srcW, $srcH);
        $cap = min($max);
        $w = $srcW;
        $h = $srcH;

        if ($longest > $cap) {
            $ratio = $cap / $longest;
            $w = max(1, (int) floor($srcW * $ratio));
            $h = max(1, (int) floor($srcH * $ratio));
        }

        $reference = tempnam(sys_get_temp_dir(), 'ref').'.png';

        $cmd = sprintf(
            '%s %s -filter Lanczos -resize %dx%d! -depth 8 %s 2>/dev/null',
            escapeshellarg($bin),
            escapeshellarg($src),
            $w,
            $h,
            escapeshellarg($reference)
        );

        exec($cmd, $output, $code);

        if ($code !== 0 || ! is_file($reference) || filesize($reference) === 0) {
            $this->markTestSkipped('Could not build the fidelity reference image.');
        }

        $bytes = (string) file_get_contents($reference);
        @unlink($reference);

        return $bytes;
    }

    /**
     * PSNR in dB between two images, via ImageMagick.
     */
    private function psnr(string $reference, string $candidate): float
    {
        $bin = trim((string) @shell_exec('command -v magick 2>/dev/null'));
        if ($bin === '') {
            $this->markTestSkipped('ImageMagick is required to measure PSNR.');
        }

        $refFile = tempnam(sys_get_temp_dir(), 'a').'.png';
        $candFile = tempnam(sys_get_temp_dir(), 'b').'.webp';
        file_put_contents($refFile, $reference);
        file_put_contents($candFile, $candidate);

        $output = [];
        $code = 0;
        exec(sprintf(
            '%s compare -metric PSNR %s %s null: 2>&1',
            escapeshellarg($bin),
            escapeshellarg($refFile),
            escapeshellarg($candFile)
        ), $output, $code);

        @unlink($refFile);
        @unlink($candFile);

        $text = trim(implode(' ', $output));
        if (! preg_match('/([0-9]+(?:\.[0-9]+)?)/', $text, $m)) {
            $this->markTestSkipped('Could not measure PSNR.');
        }

        return (float) $m[1];
    }

    /**
     * Build a PNG with a genuinely transparent background.
     */
    private function pngWithTransparency(): UploadedFile
    {
        $width = 200;
        $height = 150;

        $image = imagecreatetruecolor($width, $height);
        imagealphablending($image, false);
        imagesavealpha($image, true);

        imagefilledrectangle($image, 0, 0, $width, $height, imagecolorallocatealpha($image, 0, 0, 0, 127));
        imagefilledrectangle($image, 20, 20, 80, 80, imagecolorallocatealpha($image, 255, 0, 0, 10));

        ob_start();
        imagepng($image);
        $png = (string) ob_get_clean();
        imagedestroy($image);

        $path = tempnam(sys_get_temp_dir(), 'alpha').'.png';
        file_put_contents($path, $png);

        return new UploadedFile($path, 'logo.png', 'image/png', null, true);
    }

    /**
     * Locate a top-level chunk by its FourCC.
     */
    private function exifChunk(string $webp, ?string &$found): bool
    {
        $found = null;
        $offset = 12;
        $length = strlen($webp);

        while ($offset + 8 <= $length) {
            $fourcc = substr($webp, $offset, 4);
            $size = unpack('V', substr($webp, $offset + 4, 4))[1];

            if ($fourcc === 'EXIF') {
                $found = substr($webp, $offset + 8, $size);

                return true;
            }

            $offset += 8 + $size + ($size % 2);
        }

        return false;
    }
}
