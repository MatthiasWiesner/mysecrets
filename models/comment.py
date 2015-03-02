from datetime import datetime
import server
from models.user import User


class Comment(server.db.Document):
    content = server.db.StringField()
    date = server.db.DateTimeField(default=datetime.now())
    user = server.db.ReferenceField(User)

    def to_dict(self):
        return dict(
            id=str(self.id),
            content=self.content,
            user=self.user.to_dict(),
            date=self.date.strftime('%Y-%m-%d %H:%M:%S')
        )
