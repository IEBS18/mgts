import os
import shutil

def move_unique_subfolders(folder1, folder2, new_folder):
    # Create new folder if it doesn't exist
    if not os.path.exists(new_folder):
        os.makedirs(new_folder)

    # Get subfolders of both folders
    subfolders1 = set(os.listdir(folder1))
    subfolders2 = set(os.listdir(folder2))
    print(len(subfolders1), len(subfolders2))
    # Find unique subfolders
    unique_subfolders = subfolders1.symmetric_difference(subfolders2)
    print(len(unique_subfolders))

    # Move unique subfolders to the new folder
    # for subfolder in unique_subfolders:
    #     source_folder = os.path.join(folder1, subfolder) if subfolder in subfolders1 else os.path.join(folder2, subfolder)
    #     destination_folder = os.path.join(new_folder, subfolder)

    #     # Move folder only if it's actually a folder (not a file)
    #     if os.path.isdir(source_folder):
    #         # shutil.move(source_folder, destination_folder)
    #         print(f"Moved {subfolder} to {new_folder}")
    #     else:
    #         print(f"{subfolder} is not a folder, skipping.")

# Example usage:
folder1 = r'C:\Users\aryan.tiwari\Mindgram\storage_main'
folder2 = r'C:\Users\aryan.tiwari\Mindgram\storage'
new_folder = r'backend\storage'

move_unique_subfolders(folder1, folder2, new_folder)
