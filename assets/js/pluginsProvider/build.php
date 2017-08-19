<?php
/**
 * build.php - Builds github plugins zip plugins to phar plugins and moves it.
 * 
 * @author Ad5001
 * @version 1.0.0
 * @license NTOSL (Custom) - View LICENSE.md in the root of the project
 * @copyright (C) Ad5001 2017
 * @package PocketMine Server Manager
 */

$opts = getopt("", ["input-zip::", "output-phar::"]);
var_dump($opts);
$zipArch = new ZipArchive();
$zipArch->open($opts["input-zip"]);
var_dump($zipArch);
$pluginYml = $zipArch->getFromName("plugin.yml");
$zipArch->close();

echo "Got plugin.yml : $pluginYml\n";

$zipphar = new PharData($opts["input-zip"]);
$phar = $zipphar->convertToExecutable(Phar::PHAR);
echo "Converted ZIP, now getting into setting metadata and stub...\n";
$phar->setStub("<?php echo 'Phar built from PSM, PocketMine Server Manager (https://psm.mcpe.fun)'; __HALT_COMPILER();");
$phar->setMetadata(yaml_parse($pluginYml));
echo "Success ! Now copying file...\n";
copy($phar->getFileInfo()->getPathname(), $opts["output-phar"]);
echo "Done!\n";