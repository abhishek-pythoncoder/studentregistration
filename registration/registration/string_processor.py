import itertools

class StringProcessor:

    def __init__(self, ex_str):
        self.ex_str = ex_str

    def append(self, new_str):
        """appends and returns the new string"""
        self.ex_str = self.ex_str+new_str
        return self.ex_str

    def remove_substr(self, substr):
        """removes the given substring from the string"""
        self.ex_str = self.ex_str.replace(substr, '')
        return self.ex_str

    def mirror(self):
        """mirroring a string"""
        res = ""
        mirrorPoint = int(len(self.ex_str)/2)
        for i in range(mirrorPoint):
            res += self.ex_str[i]
        return self.ex_str[:mirrorPoint] + res[::-1]

    def save_to_file(self, text_file):
        """Saves text to a file"""
        with open(text_file, 'w') as pointer:
            pointer.write(self.ex_str)

    def read_from_file(self, file):
        """Reads text from a file"""
        with open(text_file, 'r') as read_pointer:
            self.ex_str = read_pointer.read()


class Anagram(StringProcessor):

    def all_anagrams(self):
        """create all possible anagrams out of a string"""
        return sorted(
            set(["".join(perm) for perm in itertools.permutations(
                self.ex_str)]))


class Palindrome(StringProcessor):

    def isPalindrome(self, s):
        return s == s[::-1]
    
    def __init__(self, ex_str):
        """child class that can store only Palindromes"""
        self.ex_str = ""
        if self.isPalindrome():
            self.ex_str = ex_str



