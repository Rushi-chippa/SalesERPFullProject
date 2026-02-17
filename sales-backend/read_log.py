
def read_log():
    try:
        with open('backend.log', 'r', encoding='utf-8', errors='replace') as f:
            lines = f.readlines()
            for line in lines[-20:]:  # Last 20 lines
                print(line.strip())
    except Exception as e:
        print(f"Error reading log: {e}")

if __name__ == "__main__":
    read_log()
