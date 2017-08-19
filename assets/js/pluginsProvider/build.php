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

$opts = getopt("", ["input-zip::", "output-phar::", "tmpdir::"]);
$zipArch = new ZipArchive();
$zipArch->open($opts["input-zip"]);
$zipArch->extractTo($opts["tmpdir"] . "/tmppl");
$zipArch->close();

$pluginYml = file_get_contents($opts["tmpdir"] . "/tmppl/" . scandir($opts["tmpdir"] . "/tmppl/")[2] . "/plugin.yml");

echo "Current path: " . $opts["tmpdir"] . "/tmppl/" . scandir($opts["tmpdir"] . "/tmppl/")[2] + "\n";

$phar = new Phar($opts["output-phar"]);
$phar->buildFromDirectory($opts["tmpdir"] . "/tmppl/" . scandir($opts["tmpdir"] . "/tmppl/")[2]); // Builds from the directory under the zip is.
echo "Converted ZIP, now getting into setting metadata and stub...\n";
$phar->setStub("<?php echo 'Phar built from PSM, PocketMine Server Manager (https://psm.mcpe.fun)'; __HALT_COMPILER();");
$phar->setMetadata(yaml_parse($pluginYml));
echo "Success ! Now removing temp directory...\n";
if(strpos(PHP_OS, "win") && PHP_OS !== "darwin") {
    exec("rmdir " . $opts["tmpdir"] . "/tmppl/" . " /s /q"); // Windows based OSes
} else {
    exec("rm -rf " . $opts["tmpdir"] . "/tmppl/"); // Unix based OSes
}
unlink($opts["input-zip"]);
echo "Done!\n";