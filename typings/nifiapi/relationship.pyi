
class Relationship:
    def __init__(self, name: str, description: str = "") -> None: ...
    
    name: str
    description: str

    raise NotImplementedError