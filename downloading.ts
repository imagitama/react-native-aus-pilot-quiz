import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Platform } from "react-native";

export function getFilenameFromUrl(url: string): string {
  return url.split("/").pop()!;
}

export const downloadFileWeb = (fileUrl: string, filename: string) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = filename;
  a.click();
};

/**
 * Copies a pre-bundled file from the assets folder (packaged in the app)
 * and saves it to the Android Downloads folder using expo-media-library.
 *
 * @param filenameInsideAssets - The name of the file located in the `assets/` folder.
 */
export async function downloadFileAndroid(filenameInsideAssets: string) {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Media Library permission not granted");
  }

  const sourceUri = FileSystem.bundleDirectory + filenameInsideAssets;
  const destUri = FileSystem.documentDirectory + filenameInsideAssets;

  // Copy the file from bundled assets to app-accessible location
  await FileSystem.copyAsync({
    from: sourceUri,
    to: destUri,
  });

  // Save to the system Downloads folder (via Media Library)
  const asset = await MediaLibrary.createAssetAsync(destUri);
  await MediaLibrary.createAlbumAsync("Download", asset, false);

  console.log(`Saved ${filenameInsideAssets} to Downloads`);
}

/**
 * Downloads a file on web (from anywhere inside /dist) or copies any file from the Android app (any file inside /assets) to user's documents.
 * @param fileUrlOrPath
 * @param filename
 */
export const downloadFile = async (
  fileUrlOrPath: string,
  filename?: string
) => {
  if (fileUrlOrPath[0] !== "/") {
    throw new Error(`Only absolute URLs or paths: ${fileUrlOrPath}`);
  }

  if (Platform.OS === "web") {
    downloadFileWeb(
      fileUrlOrPath,
      filename || getFilenameFromUrl(fileUrlOrPath)
    );
  } else {
    await downloadFileAndroid(fileUrlOrPath);
  }
};
