def read_file():
    try:
        with open('users.txt', 'r', encoding='utf-8', errors='replace') as f:
            print(f.read())
    except UnicodeDecodeError:
        try:
            with open('users.txt', 'r', encoding='utf-16le', errors='replace') as f:
                print(f.read())
        except Exception as e:
            print(f"Error reading users.txt: {e}")
    except Exception as e:
        print(f"Error reading users.txt: {e}")

if __name__ == "__main__":
    read_file()
