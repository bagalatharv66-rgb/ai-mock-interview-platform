import sys
import base64

def main():
    if len(sys.argv) < 2:
        print("Usage: python convert_image_to_base64.py <path_to_image.jpg>")
        return
    image_path = sys.argv[1]
    with open(image_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")
    data_url = f"data:image/jpeg;base64,{encoded}"
    with open("test_frame_output.txt", "w") as out:
        out.write(data_url)
    print(f"Done! Base64 data URL written to test_frame_output.txt ({len(data_url)} characters)")

if __name__ == "__main__":
    main()