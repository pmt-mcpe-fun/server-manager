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

$pluginZipFile = getopt("input-zip");
$pluginOutputFile = getopt("output-phar");

$zipArch = new ZipArchive();
$zipArch->open($pluginZipFile);
$pluginYml = $zipArch->getFromName("plugin.yml");
$zipArch->close();

echo "Got plugin.yml : $pluginYml\n";

$zipphar = new PharData($pluginZipFile);
$phar = $zipphar->convertToExecutable(Phar::PHAR);
echo "Converted ZIP, now getting into setting metadata and stub...\n";
$phar->setStub("<?php echo 'Phar built from PSM, PocketMine Server Manager (https://psm.mcpe.fun)'; __HALT_COMPILER();");
$phar->setMetadata(yaml_parse($pluginYml));
echo "Success ! Now copying file...\n";
copy($phar->getFileInfo()->getPathname(), $pluginOutputFile);
echo "Done!\n";