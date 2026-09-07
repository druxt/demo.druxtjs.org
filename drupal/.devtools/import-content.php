<?php

/**
 * @file
 * Imports the committed Tome content into a site whose configuration is in.
 *
 * Run as `drush php:script .devtools/import-content.php` after the
 * configuration import. `tome:import` is not used: it runs each of its steps
 * in a Drush sub-process, and the command line it builds for those does not
 * start under Drush 13. This is the same import, in one process.
 */

declare(strict_types=1);

use Drupal\Core\Site\Settings;

$content_dir = Settings::get('tome_content_directory', '../content');
$importer = \Drupal::service('tome_sync.importer');
$database = \Drupal::database();

// The installer creates uid 0 and uid 1 with fresh UUIDs. Giving those rows
// the committed UUIDs makes the import update them instead of inserting
// duplicates that collide on uid.
foreach (glob($content_dir . '/user.*.json') ?: [] as $file) {
  $data = json_decode((string) file_get_contents($file), TRUE);
  $uid = $data['uid'][0]['value'] ?? NULL;
  $uuid = $data['uuid'][0]['value'] ?? NULL;
  if (in_array($uid, [0, 1], TRUE) && is_string($uuid)) {
    $database->update('users')
      ->fields(['uuid' => $uuid])
      ->condition('uid', $uid)
      ->execute();
  }
}
\Drupal::entityTypeManager()->getStorage('user')->resetCache();

// Files first: an image field computes its width and height on save from the
// file on disk, and a media thumbnail saved before its file exists keeps null
// dimensions.
$importer->importFiles();
$count = 0;
foreach ($importer->getChunkedNames() as $chunk) {
  foreach ($chunk as $name) {
    [$entity_type_id, $uuid] = explode('.', $name, 2);
    $importer->importContent($entity_type_id, $uuid);
    $count++;
  }
}
print "Imported {$count} content entities.\n";
